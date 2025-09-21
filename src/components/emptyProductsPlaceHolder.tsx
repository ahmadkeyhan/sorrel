export default function EmptyProductsPlaceholder() {
  return (
    <div className="h-44 bg-amber-50 shadow-md rounded-lg flex items-center justify-center">
      <div className="text-center p-6">
        <h3 className="text-xl font-semibold text-teal-700 mb-2">در حال حاضر محصولی وجود ندارد.</h3>
        <p className="text-amber-500 mb-4">به زودی دوباره سر بزنید!</p>
      </div>
    </div>
  )
}

