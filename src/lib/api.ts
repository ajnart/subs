import { isDemo } from '@/lib/mode'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiResponse<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; revision: string | null }> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const requestOptions = {
    ...options,
    credentials: 'same-origin' as const,
    headers,
  }
  let response: Response
  if (isDemo) {
    const { demoResponse } = await import('@/demo/adapter')
    response = await demoResponse(path, requestOptions)
  } else {
    response = await fetch(`/api${path}`, requestOptions)
  }
  let body: unknown
  try {
    body = await response.json()
  } catch {
    if (response.status === 401) window.dispatchEvent(new Event('subs:locked'))
    throw new ApiError(response.status, 'The server returned an unreadable response. Please try again.')
  }
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event('subs:locked'))
    let message = `Request failed (${response.status})`
    if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') message = body.error
    if (response.status === 429) message = `${message}. Please wait before trying again.`
    throw new ApiError(response.status, message)
  }
  return { data: body as T, revision: response.headers.get('ETag') }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  return (await apiResponse<T>(path, options)).data
}

export async function collectionApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; revision: string }> {
  const result = await apiResponse<T>(path, options)
  if (!result.revision)
    throw new ApiError(
      428,
      'The server did not return a collection revision. Refresh and review before making more changes.',
    )
  return { data: result.data, revision: result.revision }
}

export function revisionHeaders(revision: string | null): HeadersInit {
  if (!revision) throw new ApiError(428, 'Refresh and review the collection before saving changes.')
  return { 'If-Match': revision }
}

export function isRevisionConflict(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 409 || error.status === 428)
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}
