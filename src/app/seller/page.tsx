'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSellerProducts, getSellerOrders, addProduct, updateSellerAddresses } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import ImageSlider from '@/components/ImageSlider';
import { CATEGORIES, Category, SubCategory } from '@/data/categories';
import CategorySelectorModal from '@/components/CategorySelectorModal';

export default function SellerDashboard() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Add Product State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  
  // Category State
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
  const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState('');
  const [selectedSubSubcategorySlug, setSelectedSubSubcategorySlug] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const selectedCategory = CATEGORIES.find(c => c.slug === selectedCategorySlug);
  const selectedSubcategory = selectedCategory?.subcategories?.find(s => s.slug === selectedSubcategorySlug);
  
  // Custom File Upload State
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [adding, setAdding] = useState(false);

  // Seller Addresses State
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Print Mode State
  const [showPrintFlow, setShowPrintFlow] = useState(false);
  const [printAddressChoice, setPrintAddressChoice] = useState<string>(''); // specific saved address or 'custom'
  const [customPrintAddress, setCustomPrintAddress] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!user.isSeller) {
      router.push('/become-seller');
      return;
    }
    
    setAddresses(user.seller_addresses || []);
    
    Promise.all([
      getSellerProducts(user.id),
      getSellerOrders(user.id)
    ]).then(([prods, ords]) => {
      setProducts(prods);
      setOrders(ords);
      setLoading(false);
    });
  }, [user, router]);

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAdding(true);
    try {
      let imageUrls: string[] = [];
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const uploadRes = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData,
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          imageUrls = data.urls;
        } else {
          alert('Failed to upload images');
          setAdding(false);
          return;
        }
      }
      const newProduct = await addProduct(
        user.id, 
        title, 
        description, 
        parseFloat(price), 
        discountPrice ? parseFloat(discountPrice) : null,
        parseInt(quantity) || 1,
        imageUrls,
        selectedCategorySlug || undefined,
        selectedSubcategorySlug || undefined,
        selectedSubSubcategorySlug || undefined
      );
      setProducts([newProduct, ...products]);
      setShowAddForm(false);
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setDiscountPrice('');
      setQuantity('1');
      setSelectedCategorySlug('');
      setSelectedSubcategorySlug('');
      setSelectedSubSubcategorySlug('');
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert('Failed to add product');
    } finally {
      setAdding(false);
    }
  };

  const handleSaveAddresses = async () => {
    if (!user) return;
    setSavingSettings(true);
    try {
      const rawUser = await updateSellerAddresses(user.id, addresses);
      const normalizedUser = {
        id: rawUser.id,
        email: rawUser.email,
        displayName: rawUser.display_name,
        isSeller: rawUser.is_seller,
        phoneNumber: rawUser.phone_number,
        selfieUrl: rawUser.selfie_url,
        authType: rawUser.auth_type,
        avatarUrl: rawUser.avatar_url,
        seller_addresses: rawUser.seller_addresses
      };
      updateUser(normalizedUser);
      alert('Addresses saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save addresses');
    } finally {
      setSavingSettings(false);
    }
  };

  const performPrint = (sellerAddress: string) => {
    const printWindow = window.open('', '_blank', 'width=600,height=400');
    if (printWindow) {
      const buyerAddressHtml = selectedOrder.shipping_address ? selectedOrder.shipping_address.split(',').map((s: string) => s.trim()).join('<br>') : '';
      const sellerAddressHtml = sellerAddress ? sellerAddress.split(',').map((s: string) => s.trim()).join('<br>') : '';
      
      printWindow.document.write('<html><head><title>Print Address</title>');
      printWindow.document.write('<style>body { font-family: sans-serif; padding: 2rem; font-size: 1.25rem; line-height: 1.5; white-space: pre-wrap; text-transform: capitalize; }</style>');
      printWindow.document.write('</head><body>');
      
      printWindow.document.write('<div style="margin-bottom: 3rem;">');
      printWindow.document.write('<strong>Deliver To:</strong><br><br>');
      printWindow.document.write(buyerAddressHtml);
      printWindow.document.write('</div>');

      if (sellerAddressHtml) {
        printWindow.document.write('<div style="border-top: 1px dashed #ccc; padding-top: 2rem;">');
        printWindow.document.write('<strong>From:</strong><br><br>');
        printWindow.document.write(sellerAddressHtml);
        printWindow.document.write('</div>');
      }
      
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        setShowPrintFlow(false);
      }, 100);
    }
  };

  if (!user || loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>Loading dashboard...</div>;

  return (
    <div className="full-width-bleed" style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', background: 'var(--background)' }}>
      {/* Sidebar */}
      <div style={{ 
        width: isSidebarOpen ? '260px' : '70px', 
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
        borderRight: '1px solid var(--border)',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '1px 0 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: isSidebarOpen ? 'space-between' : 'center', alignItems: 'center', padding: '1.5rem 1rem', borderBottom: '1px solid var(--border)' }}>
          {isSidebarOpen && <span style={{ fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Seller Hub</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '4px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '1.5rem 1rem' }}>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', textAlign: 'left', 
              background: activeTab === 'dashboard' ? '#f0f5fa' : 'transparent', 
              color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-main)', 
              border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', 
              fontWeight: activeTab === 'dashboard' ? 500 : 400,
              transition: 'background 0.2s'
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            {isSidebarOpen && <span>Dashboard</span>}
          </button>
          <button 
            onClick={() => setActiveTab('orders')} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', textAlign: 'left', 
              background: activeTab === 'orders' ? '#f0f5fa' : 'transparent', 
              color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-main)', 
              border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', 
              fontWeight: activeTab === 'orders' ? 500 : 400,
              transition: 'background 0.2s'
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            {isSidebarOpen && <span>Orders</span>}
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', textAlign: 'left', 
              background: activeTab === 'settings' ? '#f0f5fa' : 'transparent', 
              color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-main)', 
              border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', 
              fontWeight: activeTab === 'settings' ? 500 : 400,
              transition: 'background 0.2s'
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            {isSidebarOpen && <span>Settings</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '3rem 4rem' }}>
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontWeight: 600, margin: 0, fontSize: '1.75rem' }}>Products</h1>
              <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 500 }}>
                {showAddForm ? 'Cancel' : 'Create Product'}
              </button>
            </div>

            {showAddForm && (
              <div className="card animate-fade-in" style={{ padding: '2.5rem', marginBottom: '3rem', boxShadow: 'var(--shadow-md)', border: 'none' }}>
                <h3 style={{ marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 600 }}>Create New Product</h3>
                <form onSubmit={handleAddProduct}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                    {/* Left Column: Product Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div className="input-group" style={{ margin: 0 }}>
                        <label style={{ fontWeight: 500, color: 'var(--text-main)' }}>Title</label>
                        <input type="text" required className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Vintage Leather Jacket" style={{ padding: '0.75rem' }} />
                      </div>
                      
                      <div className="input-group" style={{ margin: 0 }}>
                        <label style={{ fontWeight: 500, color: 'var(--text-main)' }}>Description</label>
                        <textarea required className="input" rows={6} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your product..." style={{ padding: '0.75rem', resize: 'vertical' }} />
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div className="input-group" style={{ margin: 0 }}>
                          <label style={{ fontWeight: 500, color: 'var(--text-main)' }}>Original Price (₹)</label>
                          <input type="number" step="0.01" required className="input" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" style={{ padding: '0.75rem' }} />
                        </div>
                        <div className="input-group" style={{ margin: 0 }}>
                          <label style={{ fontWeight: 500, color: 'var(--text-main)' }}>Discount Price (₹)</label>
                          <input type="number" step="0.01" className="input" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} placeholder="Optional" style={{ padding: '0.75rem' }} />
                        </div>
                        <div className="input-group" style={{ margin: 0 }}>
                          <label style={{ fontWeight: 500, color: 'var(--text-main)' }}>Quantity</label>
                          <input type="number" min="1" required className="input" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="1" style={{ padding: '0.75rem' }} />
                        </div>
                      </div>
                      <p style={{ margin: '-1rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Note: Price includes a 10% platform commission.
                      </p>

                      {/* Category Selection - Mac OS Style Modal */}
                      <div className="input-group" style={{ margin: 0 }}>
                        <label style={{ fontWeight: 500, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Category</label>
                        
                        <div 
                          onClick={() => setIsCategoryModalOpen(true)}
                          style={{
                            padding: '1rem',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            background: '#fafafa',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            {selectedCategorySlug ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                <span>{selectedCategory?.name}</span>
                                {selectedSubcategory && (
                                  <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    <span>{selectedSubcategory.name}</span>
                                  </>
                                )}
                                {selectedSubSubcategorySlug && selectedSubcategory?.subcategories?.find(s => s.slug === selectedSubSubcategorySlug) && (
                                  <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    <span>{selectedSubcategory.subcategories.find(s => s.slug === selectedSubSubcategorySlug)?.name}</span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>Click to browse categories...</span>
                            )}
                          </div>
                          <button type="button" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                            {selectedCategorySlug ? 'Change' : 'Browse'}
                          </button>
                        </div>
                      </div>

                      <CategorySelectorModal 
                        isOpen={isCategoryModalOpen}
                        onClose={() => setIsCategoryModalOpen(false)}
                        onSelect={(cat, sub, subSub) => {
                          setSelectedCategorySlug(cat);
                          setSelectedSubcategorySlug(sub);
                          setSelectedSubSubcategorySlug(subSub);
                        }}
                        initialCategory={selectedCategorySlug}
                        initialSubcategory={selectedSubcategorySlug}
                        initialSubSubcategory={selectedSubSubcategorySlug}
                      />
                    </div>

                    {/* Right Column: Custom Drag & Drop Image Uploader */}
                    <div className="input-group" style={{ margin: 0, height: '100%' }}>
                      <label style={{ fontWeight: 500, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Product Images</label>
                      <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
                          backgroundColor: isDragging ? '#f0f5fa' : '#fafafa',
                          borderRadius: 'var(--radius-md)',
                          padding: '3rem 2rem',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '1rem'
                        }}
                      >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={isDragging ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <div>
                          <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)' }}>Click to upload or drag and drop</p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>SVG, PNG, JPG or GIF (max. 5MB)</p>
                        </div>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                      </div>
                      
                      {/* Image Previews */}
                      {files.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                          {files.map((file, index) => (
                            <div key={index} style={{ position: 'relative', height: '100px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt={`Preview ${index}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              />
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                style={{
                                  position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
                                }}
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: 'var(--radius-md)', fontWeight: 500 }} disabled={adding}>
                      {adding ? 'Publishing...' : 'Publish Product'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid-cols-auto">
              {products.map(product => (
                <div key={product.id} className="card card-hoverable" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ width: '100%', height: '180px' }}>
                    <ImageSlider images={product.image_urls} />
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 600 }}>{product.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {product.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                      <div>
                        {product.discount_price ? (
                          <>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginRight: '0.5rem' }}>₹{product.price}</span>
                            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{product.discount_price}</span>
                          </>
                        ) : (
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{product.price}</span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(product.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && !showAddForm && (
                <div style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', color: 'var(--border)' }}>
                    <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>You haven't listed any products yet.</p>
                  <button onClick={() => setShowAddForm(true)} className="btn btn-primary">Create Your First Product</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 style={{ fontWeight: 600, margin: '0 0 2rem 0', fontSize: '1.75rem' }}>Order History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.reverse().map(order => (
                <div 
                  key={order.id} 
                  className="card card-hoverable" 
                  style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', border: 'none', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order ID: <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{order.id}</span> • {new Date(order.created_at || order.createdAt).toLocaleDateString()}</span>
                    <div style={{ marginTop: '1rem' }}>
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} style={{ fontWeight: 500, padding: '0.5rem 0', borderBottom: idx !== order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>{item.quantity}x</span> {item.title}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, background: order.status === 'pending' ? '#fff3cd' : '#d4edda', color: order.status === 'pending' ? '#856404' : '#155724', alignSelf: 'flex-end' }}>
                      {order.status.toUpperCase()}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Amount</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        ₹{order.total_amount || order.totalAmount || order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  No orders received yet. Keep sharing your products!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
          }} onClick={() => setSelectedOrder(null)}>
            <div style={{
              background: 'var(--background)', borderRadius: 'var(--radius-lg)', padding: '2.5rem',
              width: '100%', minWidth: 'min(90vw, 600px)', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
              position: 'relative', boxShadow: 'var(--shadow-lg)'
            }} onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >&times;</button>
              
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>Order Details</h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 0.5rem', wordBreak: 'break-all' }}><span style={{ color: 'var(--text-muted)' }}>Order ID:</span> <span style={{ fontFamily: 'monospace' }}>{selectedOrder.id}</span></p>
                <p style={{ margin: '0 0 0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Date:</span> {new Date(selectedOrder.created_at || selectedOrder.createdAt).toLocaleString()}</p>
                <p style={{ margin: '0 0 0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Status:</span> <span style={{ fontWeight: 600, color: selectedOrder.status === 'pending' ? '#d97706' : '#16a34a' }}>{selectedOrder.status.toUpperCase()}</span></p>
              </div>

              <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Shipping Address</h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const copyAddress = selectedOrder.shipping_address ? selectedOrder.shipping_address.split(',').map((s: string) => s.trim()).join('\n') : '';
                        navigator.clipboard.writeText(copyAddress);
                        alert('Address copied to clipboard!');
                      }}
                      className="btn btn-secondary" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                    >
                      Copy
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPrintFlow(!showPrintFlow);
                      }}
                      className="btn btn-primary" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                    >
                      {showPrintFlow ? 'Cancel Print' : 'Print Label'}
                    </button>
                  </div>
                </div>
                
                {showPrintFlow && (
                  <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid var(--primary)', animation: 'fadeIn 0.2s' }}>
                    <h5 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Select "From" Address</h5>
                    
                    {addresses.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                        {addresses.map((addr, i) => (
                          <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                            <input 
                              type="radio" 
                              name="printAddress" 
                              checked={printAddressChoice === addr} 
                              onChange={() => setPrintAddressChoice(addr)} 
                              style={{ marginTop: '0.25rem' }}
                            />
                            <span style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{addr}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>You have no saved addresses. You can add them in Settings.</p>
                    )}
                    
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
                      <input 
                        type="radio" 
                        name="printAddress" 
                        checked={printAddressChoice === 'custom'} 
                        onChange={() => setPrintAddressChoice('custom')} 
                        style={{ marginTop: '0.25rem' }}
                      />
                      <span style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>Custom Address (One-time)</span>
                    </label>
                    
                    {printAddressChoice === 'custom' && (
                      <textarea 
                        className="input" 
                        rows={3} 
                        placeholder="Enter return address for this label..."
                        value={customPrintAddress}
                        onChange={e => setCustomPrintAddress(e.target.value)}
                        style={{ width: '100%', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.5rem' }}
                      />
                    )}
                    
                    <button 
                      onClick={() => {
                        let finalAddress = '';
                        if (printAddressChoice === 'custom') {
                          finalAddress = customPrintAddress;
                        } else if (printAddressChoice) {
                          finalAddress = printAddressChoice;
                        } else if (addresses.length > 0) {
                          finalAddress = addresses[0];
                        }
                        performPrint(finalAddress);
                      }}
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                    >
                      Generate Label
                    </button>
                  </div>
                )}

                <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5', textTransform: 'capitalize' }}>
                  {selectedOrder.shipping_address ? selectedOrder.shipping_address.split(',').map((s: string) => s.trim()).join('\n') : ''}
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '1.1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Items</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px dashed var(--border)', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
                          {item.image_url ? (
                            <img src={item.image_url.startsWith('/') ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '')}${item.image_url}` : item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{item.title}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quantity: {item.quantity}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</div>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Total</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>₹{selectedOrder.total_amount || selectedOrder.totalAmount || selectedOrder.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)}</span>
                </div>
              </div>

              <div style={{ padding: '1.5rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #10b981', color: '#047857' }}>
                <h4 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Payment Received
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Paid via Mock Payment Gateway by buyer.</p>
              </div>
              
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card" style={{ padding: '2.5rem', border: 'none', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontWeight: 600, margin: '0 0 1rem 0', fontSize: '1.75rem' }}>Store Settings</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Manage your seller profile, payout methods, and notifications.</p>
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Saved "From" Addresses</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                These addresses can be used as the return address when generating shipping labels.
              </p>
              
              {addresses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  {addresses.map((addr, i) => (
                    <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.5', textTransform: 'capitalize' }}>
                        {addr}
                      </div>
                      <button 
                        onClick={() => setAddresses(addresses.filter((_, index) => index !== i))}
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#fafafa', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', marginBottom: '2rem' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No saved addresses. Add one below.</p>
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
                <textarea 
                  className="input" 
                  rows={4} 
                  placeholder="E.g.&#10;G 106&#10;signature splendor&#10;bengaluru 562107"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  style={{ padding: '1rem' }}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => {
                      if (newAddress.trim()) {
                        setAddresses([...addresses, newAddress.trim()]);
                        setNewAddress('');
                      }
                    }}
                    className="btn btn-secondary"
                  >
                    Add to List
                  </button>
                  <button 
                    onClick={handleSaveAddresses}
                    className="btn btn-primary"
                    disabled={savingSettings}
                  >
                    {savingSettings ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
