import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">فراخوانی یافت نشد</h1>
      <p className="text-gray-600 mb-8">
        فراخوانی مورد نظر شما یافت نشد یا ممکن است حذف شده باشد.
      </p>
      <Button asChild>
        <Link href="/admin">
          بازگشت به پنل
        </Link>
      </Button>
    </div>
  )
}
