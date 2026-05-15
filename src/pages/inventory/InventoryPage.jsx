import React, { useState } from 'react'
import { Plus, Search, Filter, LayoutGrid, List as ListIcon, Package } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const MOCK_PRODUCTS = [
  { 
    id: '1', 
    name: 'Black Galaxy Granite', 
    category: 'Granite', 
    thickness: '18mm', 
    finish: 'Polished', 
    stock: 1200, 
    unit: 'sqft', 
    price: 185,
    image: 'https://images.unsplash.com/photo-1590065582384-633005a3977c?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: '2', 
    name: 'Tan Brown Granite', 
    category: 'Granite', 
    thickness: '20mm', 
    finish: 'Lapatro', 
    stock: 850, 
    unit: 'sqft', 
    price: 145,
    image: 'https://images.unsplash.com/photo-1590065582384-633005a3977c?auto=format&fit=crop&q=80&w=800' // Using similar for mock
  },
  { 
    id: '3', 
    name: 'White Marble Tile', 
    category: 'Tiles', 
    thickness: '10mm', 
    finish: 'Glossy', 
    stock: 5000, 
    unit: 'pcs', 
    price: 65,
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: '4', 
    name: 'Alaska White', 
    category: 'Granite', 
    thickness: '18mm', 
    finish: 'Polished', 
    stock: 450, 
    unit: 'sqft', 
    price: 210,
    image: 'https://images.unsplash.com/photo-1590065582384-633005a3977c?auto=format&fit=crop&q=80&w=800'
  },
]

const InventoryPage = () => {
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [adjustAmount, setAdjustAmount] = useState('')

  const handleAdjust = (product) => {
    setSelectedProduct(product)
    setAdjustAmount('')
  }

  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-8 p-4 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary">Inventory</h1>
          <p className="text-text-secondary text-sm">Manage your stock and product catalog</p>
        </div>
        <Button className="w-full lg:w-auto">
          <Plus size={20} />
          Add New Product
        </Button>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled" size={20} />
          <input
            type="text"
            placeholder="Search products, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-surface border border-border text-text-primary rounded-card py-3 pl-12 pr-4 focus:border-accent-primary focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button className="p-3 bg-bg-surface border border-border rounded-card text-text-secondary hover:text-accent-primary transition-colors">
            <Filter size={20} />
          </button>
          <div className="flex bg-bg-surface border border-border rounded-card p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-accent-primary text-bg-primary' : 'text-text-secondary hover:text-text-primary'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-accent-primary text-bg-primary' : 'text-text-secondary hover:text-text-primary'}`}
            >
              <ListIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card-premium p-0 overflow-hidden group">
              <div className="aspect-video relative overflow-hidden bg-bg-elevated">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/60 to-transparent" />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <span className="text-[10px] uppercase tracking-widest text-accent-primary font-bold px-2 py-1 bg-accent-primary/10 rounded-full mb-2 inline-block">
                      {product.category}
                    </span>
                    <h3 className="font-display font-bold text-lg text-text-primary line-clamp-1">{product.name}</h3>
                  </div>
                  <p className="font-bold text-accent-primary ml-4 italic">₹{product.price}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">Finish: {product.finish}</span>
                    <span className="text-text-secondary">Thickness: {product.thickness}</span>
                  </div>
                  <div className="h-px bg-border w-full" />
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-text-disabled uppercase font-bold tracking-tighter">Current Stock</span>
                      <span className={`text-xl font-display font-bold ${product.stock < 500 ? 'text-accent-danger' : 'text-text-primary'}`}>
                        {product.stock.toLocaleString()} <span className="text-xs font-sans text-text-secondary font-normal uppercase">{product.unit}</span>
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8"
                      onClick={() => handleAdjust(product)}
                    >
                      Adjust
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-premium overflow-hidden border-none p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-elevated/50 text-text-disabled text-[10px] uppercase tracking-widest font-bold">
                <th className="p-4 border-b border-border">Product</th>
                <th className="p-4 border-b border-border">Category</th>
                <th className="p-4 border-b border-border">Details</th>
                <th className="p-4 border-b border-border text-right">Stock</th>
                <th className="p-4 border-b border-border text-right">Price</th>
                <th className="p-4 border-b border-border text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-bg-elevated/30 transition-colors border-b border-border last:border-0">
                  <td className="p-4 font-bold text-text-primary">{product.name}</td>
                  <td className="p-4">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-accent-primary/10 text-accent-primary rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 text-text-secondary">
                    {product.thickness} • {product.finish}
                  </td>
                  <td className={`p-4 text-right font-bold ${product.stock < 500 ? 'text-accent-danger' : 'text-text-primary'}`}>
                    {product.stock.toLocaleString()} {product.unit}
                  </td>
                  <td className="p-4 text-right font-bold text-accent-primary">₹{product.price}</td>
                  <td className="p-4 text-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-3"
                      onClick={() => handleAdjust(product)}
                    >
                      Update
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjustment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border rounded-[32px] w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Adjust Stock</h2>
            <p className="text-text-secondary text-sm mb-6">
              Update inventory for <span className="text-text-primary font-bold">{selectedProduct.name}</span>
            </p>

            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-text-secondary text-sm mb-2 ml-1">Adjustment Type</label>
                <div className="flex bg-bg-elevated p-1 rounded-card border border-border">
                  <button className="flex-1 py-2 bg-accent-primary text-bg-primary font-bold rounded-lg text-sm">Add Stock</button>
                  <button className="flex-1 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm">Wastage</button>
                  <button className="flex-1 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm">Correction</button>
                </div>
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-2 ml-1">Quantity ({selectedProduct.unit})</label>
                <input
                  type="number"
                  placeholder="Enter amount..."
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full bg-bg-elevated border border-border text-text-primary rounded-card py-3 px-4 focus:border-accent-primary focus:outline-none transition-colors"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedProduct(null)}>Cancel</Button>
                <Button className="flex-1" onClick={() => setSelectedProduct(null)}>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryPage
