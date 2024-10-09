import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface InstructionsPopupProps {
  popupKey: string
}

const defaultContent = `
# Welcome to Subscription Manager

This application helps you manage and track your subscriptions easily.

## How to use:

1. **Add a subscription:**
   - Enter the subscription name (e.g., Netflix, Spotify) in the "Name" field.
   - Input the subscription's website URL (e.g., netflix.com) in the "URL" field.
   - Enter the subscription price in the "Price" field.
   - Click the "Add Subscription" button to save your new subscription.
   - The application will automatically fetch and display the logo based on the domain name you entered.

2. **View subscriptions:**
   - All your added subscriptions will be displayed in a list.
   - Each entry shows the subscription name, logo, price, and website URL.

3. **Remove a subscription:**
   - To remove a subscription, click the "Delete" button next to the corresponding entry in the list.

4. **Edit a subscription:**
   - Click the "Edit" button next to a subscription to modify its details.
   - Update the necessary fields and click "Save" to apply your changes.

5. **Track total costs:**
   - The application automatically calculates and displays your total monthly subscription costs.

Note: This popup and website **both** uses *localStorage to remember* if you've dismissed it. **This allows persistence of the data without using a database**
`

export default function InstructionsPopup({ popupKey }: InstructionsPopupProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const dismissed = localStorage.getItem(popupKey)
    if (dismissed) {
      setIsVisible(false)
    }
  }, [popupKey])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem(popupKey, 'true')
  }

  if (!isVisible) return null

  return (
    <Card className="w-full mb-6 max-w-full border border-gray-200 shadow-lg bg-gray-50 dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-blue-500 dark:text-blue-400" />
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">Instructions</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={handleDismiss}
          aria-label="Dismiss instructions"
        >
          <X className="h-6 w-6" />
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300 prose-headings:text-gray-800 dark:prose-headings:text-gray-200 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-700 dark:prose-strong:text-gray-300">
          <ReactMarkdown>{defaultContent}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}
