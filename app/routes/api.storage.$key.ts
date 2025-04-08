import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { defaultSubscriptions } from '~/store/subscriptionStore'

const CONFIG_FILE = path.join(process.cwd(), '/data/config.json')

async function readConfig(): Promise<Record<string, any>> {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {}
    }
    console.error('Error reading config file:', error)
    return {}
  }
}

async function writeConfig(config: Record<string, any>): Promise<void> {
  try {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing config file:', error)
  }
}

export const loader: LoaderFunction = async ({ params }) => {
  try {
    const config = await readConfig()
    const key = params.key
    if (key === undefined) {
      return json({ error: 'Key is undefined' }, { status: 400 })
    }
    const value = config[key]
    if (value === undefined && key === 'subscription-storage') {
      // Return default subscriptions if the key is not found
      return json({ value: { state: { subscriptions: defaultSubscriptions } } })
    }
    return json({ value: value || null })
  } catch (error) {
    console.error('Loader error:', error)
    return json({ value: null })
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  try {
    const key = params.key
    const config = await readConfig()

    if (key === undefined) {
      return json({ error: 'Key is undefined' }, { status: 400 })
    }

    if (request.method === 'PUT') {
      const { value } = await request.json()
      config[key] = value
      await writeConfig(config)
      return json({ success: true })
    }

    if (request.method === 'DELETE') {
      delete config[key]
      await writeConfig(config)
      return json({ success: true })
    }

    return json({ error: 'Method not allowed' }, { status: 405 })
  } catch (error) {
    console.error('Action error:', error)
    return json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
