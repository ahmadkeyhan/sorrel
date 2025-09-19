"use client"

import { useState, useEffect } from "react"
import { Plus, Minus, Save, ListOrdered , AlertTriangle, ListCheck, MinusCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/toastContext"
import {
  updatePriceListItemRecipe,
  getMenuItemWithRecipes,
  getMenuItems
} from "@/lib/data/recipeData"
import { getMaterials } from "@/lib/data/inventoryData"
import { formatCurrency } from "@/lib/utils"

interface Material {
  _id: string
  name: string
  unit: string
  unitPrice: number
  category?: string
}

interface MaterialUsage {
  materialId: string
  units: number
}

interface MenuItem {
  _id: string
  name: string
  priceList: Array<{
    subItem: string
    price: number
    materials?: Array<{
      materialId: Material
      units: number
    }>
  }>
}

interface RecipeBuilderProps {
  menuItemId?: string
  onClose?: () => void
}

export default function RecipeBuilder({ menuItemId, onClose }: RecipeBuilderProps) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null)
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0)
  const [currentRecipe, setCurrentRecipe] = useState<MaterialUsage[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState(menuItemId || "")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadMaterials()
    loadItems()
  }, [])

  useEffect(() => {
    if (selectedItemId) {
      loadMenuItem(selectedItemId)
    }
  }, [selectedItemId])

  const loadMaterials = async () => {
    const materialsData = await getMaterials()
    setMaterials(materialsData)
  }

  const loadItems = async () => {
    const items = await getMenuItems()
    setItems(items)
  }


  const loadMenuItem = async (itemId: string) => {
    setLoading(true)
    try {
      const result = await getMenuItemWithRecipes(itemId)
      if (result.success && result.menuItem) {
        setMenuItem(result.menuItem)
        loadCurrentRecipe(result.menuItem, 0)
      } else {
        toast({
          title: "خطا",
          description: result.error || "خطا در بارگذاری آیتم منو",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در بارگذاری آیتم منو",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCurrentRecipe = (item: MenuItem, priceIndex: number) => {
    if (item.priceList && item.priceList[priceIndex]?.materials) {
      const recipe = item.priceList[priceIndex].materials!.map((m) => ({
        materialId: m.materialId._id,
        units: m.units,
      }))
      setCurrentRecipe(recipe)
    } else {
      setCurrentRecipe([])
    }
  }

  const addMaterialToRecipe = () => {
    setCurrentRecipe([...currentRecipe, { materialId: "", units: 0 }])
  }

  const removeMaterialFromRecipe = (index: number) => {
    const newRecipe = currentRecipe.filter((_, i) => i !== index)
    setCurrentRecipe(newRecipe)
  }

  const updateMaterialInRecipe = (index: number, field: keyof MaterialUsage, value: string | number) => {
    const newRecipe = [...currentRecipe]
    newRecipe[index] = {
      ...newRecipe[index],
      [field]: field === "units" ? Number(value) : value,
    }
    setCurrentRecipe(newRecipe)
  }

  const calculateRecipeCost = () => {
    return currentRecipe.reduce((total, item) => {
      const material = materials.find((m) => m._id === item.materialId)
      if (material) {
        return total + material.unitPrice * item.units
      }
      return total
    }, 0)
  }

  const saveRecipe = async () => {
    if (!menuItem) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("menuItemId", menuItem._id)
      formData.append("materials", JSON.stringify(currentRecipe))
      formData.append("priceListIndex", selectedPriceIndex.toString())
    
        const result = await updatePriceListItemRecipe(formData)

      if (result.success) {
        toast({
          title: "موفقیت",
          description: result.message,
        })
        // Reload the menu item to get updated data
        await loadMenuItem(menuItem._id)
        await loadItems()
      } else {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ذخیره رسپی",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePriceItemChange = (index: number) => {
    setSelectedPriceIndex(index)
    if (menuItem) {
      loadCurrentRecipe(menuItem, index)
    }
  }

  if (loading || items.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-qqteal">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-qqteal mx-auto mb-4"></div>
            <p>در حال بارگذاری...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!selectedItemId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5" />
            رسپی آیتم‌ها
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>انتخاب آیتم منو</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="آیتم منو را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      <div className="flex items-center gap-2">
                        {item.name}
                        <Badge variant="outline" className="text-xs">
                          {item.priceList ? `${item.priceList.length} تنوع` : "تک قیمت"}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!menuItem) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p>آیتم منو یافت نشد</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card dir="rtl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-qqteal">
            <div className="flex items-center gap-2">
                <ListOrdered className="h-6 w-6" />
                <h3 className="text-lg">{menuItem.name}:</h3>
            </div>
            <Button variant="outline" onClick={() => setSelectedItemId("")}>
                بازگشت
                <ChevronRight className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4">
            <Tabs 
                value={selectedPriceIndex.toString()} 
                onValueChange={(value) => handlePriceItemChange(Number(value))}
                className="flex flex-col gap-4"
            >
                <TabsList className="flex flex-wrap h-auto bg-amber-100 text-qqdarkbrown">
                {menuItem.priceList.map((item, index) => (
                    <TabsTrigger key={index} value={index.toString()} className="flex-grow">
                        {item.subItem}
                    </TabsTrigger>
                ))}
                </TabsList>

                {menuItem.priceList.map((item, index) => (
                <TabsContent dir="rtl" key={index} value={index.toString()}>
                    <RecipeEditor
                    materials={materials}
                    currentRecipe={currentRecipe}
                    onAddMaterial={addMaterialToRecipe}
                    onRemoveMaterial={removeMaterialFromRecipe}
                    onUpdateMaterial={updateMaterialInRecipe}
                    recipeCost={calculateRecipeCost()}
                    onSave={saveRecipe}
                    loading={loading}
                    />
                </TabsContent>
                ))}
            </Tabs>
        </CardContent>
      </Card>

      {onClose && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            بستن
          </Button>
        </div>
      )}
    </div>
  )
}

interface RecipeEditorProps {
  materials: Material[]
  currentRecipe: MaterialUsage[]
  onAddMaterial: () => void
  onRemoveMaterial: (index: number) => void
  onUpdateMaterial: (index: number, field: keyof MaterialUsage, value: string | number) => void
  recipeCost: number
  onSave: () => void
  loading: boolean
}

function RecipeEditor({
  materials,
  currentRecipe,
  onAddMaterial,
  onRemoveMaterial,
  onUpdateMaterial,
  recipeCost,
  onSave,
  loading,
}: RecipeEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-qqteal">
        <h3 className="text-base font-bold">مواد اولیه مورد نیاز</h3>
        <Button onClick={onAddMaterial} size="sm">
          <Plus className="h-4 w-4" />
          افزودن ماده
        </Button>
      </div>

      <div className="space-y-3">
        {currentRecipe.map((item, index) => (
          <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
            <div className="flex-1">
              <Select value={item.materialId} onValueChange={(value) => onUpdateMaterial(index, "materialId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="ماده اولیه" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((material) => (
                    <SelectItem key={material._id} value={material._id}>
                      <div className="w-full">
                        <span>{material.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-20">
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="مقدار"
                value={item.units || ""}
                onChange={(e) => onUpdateMaterial(index, "units", e.target.value)}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              {materials.find((m) => m._id === item.materialId)?.unit || "واحد"}
            </div>

            <div className="text-sm font-medium">
              {item.materialId && item.units
                ? formatCurrency((materials.find((m) => m._id === item.materialId)?.unitPrice || 0) * item.units)
                : ""}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveMaterial(index)}
              className="text-red-500 hover:text-red-700 px-0"
            >
              <MinusCircle className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>

      {currentRecipe.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>هنوز ماده‌ای اضافه نشده است</p>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-lg font-semibold">هزینه کل : {formatCurrency(recipeCost)} تومان</div>
        <Button onClick={onSave} disabled={loading || currentRecipe.length === 0} className="bg-qqteal">
          <Save className="h-4 w-4" />
          {loading ? "در حال ذخیره..." : "ذخیره رسپی"}
        </Button>
      </div>
    </div>
  )
}
