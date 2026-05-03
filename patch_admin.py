import re

with open('frontend/src/pages/Admin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# ────────────────────────────────────────────────────────────────────
# 1. Add 'uploadImage' to the API imports
# ────────────────────────────────────────────────────────────────────
old_import = "  fetchAllBannersAdmin, createBanner, updateBanner, deleteBanner\n} from '../services/api';"
new_import  = "  fetchAllBannersAdmin, createBanner, updateBanner, deleteBanner,\n  uploadImage\n} from '../services/api';"
if old_import in content:
    content = content.replace(old_import, new_import, 1)
    print('DONE: Added uploadImage to imports')
else:
    print('WARN: import line not found, trying alt...')
    if 'deleteBanner\n} from' in content:
        content = content.replace('deleteBanner\n} from', 'deleteBanner,\n  uploadImage\n} from', 1)
        print('DONE: Added uploadImage (alt method)')

# ────────────────────────────────────────────────────────────────────
# 2. Add Image icon to lucide imports
# ────────────────────────────────────────────────────────────────────
old_lucide = "import { Users, Package, Store as StoreIcon, Zap, Edit, Trash, Plus, Check, LayoutGrid, MapPin, ShoppingBag, ChevronDown, Truck, Clock, BarChart3, TrendingUp, DollarSign, Activity, Tag as TagIcon } from 'lucide-react';"
new_lucide  = "import { Users, Package, Store as StoreIcon, Zap, Edit, Trash, Plus, Check, LayoutGrid, MapPin, ShoppingBag, ChevronDown, Truck, Clock, BarChart3, TrendingUp, DollarSign, Activity, Tag as TagIcon, Image as ImageIcon, Calendar, Rocket, ToggleLeft, ToggleRight } from 'lucide-react';"
if old_lucide in content:
    content = content.replace(old_lucide, new_lucide, 1)
    print('DONE: Updated lucide imports')

# ────────────────────────────────────────────────────────────────────
# 3. Add 'media' tab to sidebar nav
# ────────────────────────────────────────────────────────────────────
old_nav_coupons = "                { id: 'coupons', label: 'Coupons Manager', icon: <TagIcon size={20}/> },"
new_nav_coupons  = "                { id: 'coupons', label: 'Coupons Manager', icon: <TagIcon size={20}/> },\n                { id: 'media', label: 'Media Manager', icon: <ImageIcon size={20}/> },"
if old_nav_coupons in content:
    content = content.replace(old_nav_coupons, new_nav_coupons, 1)
    print('DONE: Added Media Manager tab')
else:
    print('WARN: Nav coupons line not found')

# ────────────────────────────────────────────────────────────────────
# 4. Add launch mode fields to appSettings state
# ────────────────────────────────────────────────────────────────────
old_state = "    // Home Page Carousel & Promo Cards\n    heroImages: '[]',\n    homePromoCards: '[]',\n    deliverySectionImage: '',"
new_state  = "    // Home Page Carousel & Promo Cards\n    heroImages: '[]',\n    homePromoCards: '[]',\n    deliverySectionImage: '',\n    // Launch Mode\n    isLaunchMode: false,\n    launchDate: '',\n    launchMessage: 'We are launching soon! Stay tuned.',\n    // Delivery Slots\n    deliverySlots: '[]',"
if old_state in content:
    content = content.replace(old_state, new_state, 1)
    print('DONE: Added launch mode to state')

# ────────────────────────────────────────────────────────────────────
# 5. Remove the old "Home Page Image Containers" and "Promo Cards" sections 
#    from SETTINGS tab (they move to Media Manager)
#    Keep the Delivery Section Image in Settings since it's more of a "trust" config
# ────────────────────────────────────────────────────────────────────
# Find start of hero images block inside settings
hero_start = content.find("                           {/* Home Page Image Containers */}")
hero_end   = content.find("                           {/* Delivery Section Image */}", hero_start)
# Keep delivery section image in settings; remove hero + promo
if hero_start != -1 and hero_end != -1:
    # Remove hero + promo sections
    content = content[:hero_start] + content[hero_end:]
    print('DONE: Removed hero/promo sections from Settings tab')
else:
    print(f'WARN: Could not find hero section bounds: start={hero_start}, end={hero_end}')

# ────────────────────────────────────────────────────────────────────
# 6. Add launch mode & delivery slots sections to Settings tab
#    Insert BEFORE the Vegetable Delivery Slots section
# ────────────────────────────────────────────────────────────────────
launch_section = r"""
                           {/* Launch / Marketing Mode */}
                           <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm ring-4 ring-orange-50">
                             <div className="flex items-center justify-between mb-4">
                               <div>
                                 <h3 className="font-black text-slate-800 flex items-center gap-2"><Rocket size={18} className="text-orange-500" /> Launch / Marketing Mode</h3>
                                 <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Enable to let people browse but not order. Set a launch date to auto-open ordering.</p>
                               </div>
                               <button
                                 type="button"
                                 onClick={() => setAppSettings({...appSettings, isLaunchMode: !appSettings.isLaunchMode})}
                                 className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition ${appSettings.isLaunchMode ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                               >
                                 {appSettings.isLaunchMode ? <><ToggleRight size={18} /> Launch Mode ON</> : <><ToggleLeft size={18} /> Launch Mode OFF</>}
                               </button>
                             </div>
                             {appSettings.isLaunchMode && (
                               <div className="space-y-4 mt-2 border-t border-orange-100 pt-4">
                                 <div>
                                   <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">Launch Date (Ordering Opens On)</label>
                                   <input
                                     type="date"
                                     value={appSettings.launchDate || ''}
                                     onChange={e => setAppSettings({...appSettings, launchDate: e.target.value})}
                                     className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-orange-400 outline-none font-bold"
                                   />
                                   <p className="text-[10px] text-slate-400 font-bold mt-1">Ordering will automatically open from this date. Leave blank to keep closed indefinitely.</p>
                                 </div>
                                 <div>
                                   <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">Message Shown to Customers</label>
                                   <input
                                     type="text"
                                     value={appSettings.launchMessage || ''}
                                     onChange={e => setAppSettings({...appSettings, launchMessage: e.target.value})}
                                     className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-orange-400 outline-none font-bold"
                                     placeholder="We are launching soon! Stay tuned."
                                   />
                                 </div>
                                 <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                   <p className="text-xs font-black text-orange-700 flex items-center gap-1"><Rocket size={12} /> Currently in LAUNCH MODE — customers can browse but cannot place orders.</p>
                                 </div>
                               </div>
                             )}
                           </div>

                           {/* Delivery Slots Manager */}
                           <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm">
                             <h3 className="font-black text-slate-800 mb-1 flex items-center gap-2"><Clock size={18} /> Delivery Slots</h3>
                             <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-widest">Configure delivery time windows. Customers will see available slots when placing orders.</p>
                             <div className="space-y-3 mb-4">
                               {(() => {
                                 let slots = [];
                                 try { slots = JSON.parse(appSettings.deliverySlots || '[]'); } catch {}
                                 if (slots.length === 0) slots = [
                                   { id: 's1', label: '8 AM – 10 AM',  cutoffHour: 7 },
                                   { id: 's2', label: '12 PM – 2 PM',  cutoffHour: 11 },
                                   { id: 's3', label: '4 PM – 6 PM',   cutoffHour: 15 },
                                   { id: 's4', label: '7 PM – 9 PM',   cutoffHour: 18 },
                                 ];
                                 return slots.map((slot, idx) => (
                                   <div key={slot.id || idx} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                     <Clock size={16} className="text-slate-400 flex-shrink-0" />
                                     <input
                                       className="flex-1 bg-transparent font-bold text-sm outline-none"
                                       value={slot.label}
                                       onChange={e => {
                                         let curr = [];
                                         try { curr = JSON.parse(appSettings.deliverySlots || '[]'); } catch {}
                                         if (curr.length === 0) curr = slots;
                                         curr[idx] = { ...curr[idx], label: e.target.value };
                                         setAppSettings({...appSettings, deliverySlots: JSON.stringify(curr)});
                                       }}
                                       placeholder="e.g. 8 AM – 10 AM"
                                     />
                                     <div className="flex items-center gap-1">
                                       <label className="text-[10px] text-slate-400 font-bold">Cutoff Hr:</label>
                                       <input
                                         type="number" min="0" max="23"
                                         className="w-14 text-center bg-white border border-slate-200 rounded-lg py-1 font-bold text-sm outline-none focus:border-[var(--secondary)]"
                                         value={slot.cutoffHour ?? ''}
                                         onChange={e => {
                                           let curr = [];
                                           try { curr = JSON.parse(appSettings.deliverySlots || '[]'); } catch {}
                                           if (curr.length === 0) curr = slots;
                                           curr[idx] = { ...curr[idx], cutoffHour: parseInt(e.target.value) };
                                           setAppSettings({...appSettings, deliverySlots: JSON.stringify(curr)});
                                         }}
                                       />
                                     </div>
                                     <button
                                       type="button"
                                       onClick={() => {
                                         let curr = [];
                                         try { curr = JSON.parse(appSettings.deliverySlots || '[]'); } catch {}
                                         if (curr.length === 0) curr = slots;
                                         curr.splice(idx, 1);
                                         setAppSettings({...appSettings, deliverySlots: JSON.stringify(curr)});
                                       }}
                                       className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"
                                     >
                                       <Trash size={14} />
                                     </button>
                                   </div>
                                 ));
                               })()}
                             </div>
                             <button
                               type="button"
                               onClick={() => {
                                 let curr = [];
                                 try { curr = JSON.parse(appSettings.deliverySlots || '[]'); } catch {}
                                 curr.push({ id: `s${Date.now()}`, label: 'New Slot', cutoffHour: 8 });
                                 setAppSettings({...appSettings, deliverySlots: JSON.stringify(curr)});
                               }}
                               className="flex items-center gap-2 text-sm font-black text-[var(--secondary)] bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition"
                             >
                               <Plus size={16} /> Add Slot
                             </button>
                           </div>

"""

# Insert before Vegetable Delivery Slots section in settings tab
veg_slot_marker = "                           {/* Vegetable Delivery Slots Section */}"
if veg_slot_marker in content:
    content = content.replace(veg_slot_marker, launch_section + veg_slot_marker, 1)
    print('DONE: Added launch mode + delivery slots sections to Settings')
else:
    print('WARN: Could not find Vegetable Slots marker')

# ────────────────────────────────────────────────────────────────────
# 7. Add MEDIA MANAGER tab content (before the last </> in tab area)
# ────────────────────────────────────────────────────────────────────
media_tab = r"""
                   {/* MEDIA MANAGER */}
                   {activeTab === 'media' && (
                     <div className="animate-fade-in">
                       <div className="mb-8">
                         <h2 className="text-2xl font-black mb-2 text-slate-900">Media Manager</h2>
                         <p className="text-gray-500 font-medium">Upload and manage images for the home page carousel, promotional cards, and delivery section.</p>
                       </div>

                       <div className="space-y-8">
                         {/* Hero Carousel */}
                         <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm">
                           <h3 className="font-black text-slate-800 text-lg mb-1 flex items-center gap-2"><ImageIcon size={20} className="text-blue-500" /> Hero Carousel</h3>
                           <p className="text-xs text-slate-400 font-bold mb-5 uppercase tracking-widest">Full-width auto-scrolling banner at the top of the home page</p>

                           {/* Current slides */}
                           <div className="space-y-3 mb-5">
                             {(() => {
                               let imgs = [];
                               try { imgs = JSON.parse(appSettings.heroImages || '[]'); } catch {}
                               if (imgs.length === 0) return (
                                 <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-300">
                                   <ImageIcon size={32} className="mx-auto mb-2" />
                                   <p className="text-sm font-black uppercase tracking-widest">No slides uploaded yet</p>
                                   <p className="text-xs font-medium mt-1">Upload images below to populate the home page carousel</p>
                                 </div>
                               );
                               return imgs.map((img, idx) => (
                                 <div key={img.id || idx} className="flex items-center gap-4 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                                   <div className="w-28 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 bg-slate-200">
                                     <img src={img.url} className="w-full h-full object-cover" alt="" />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                     <p className="text-xs font-bold text-slate-800 truncate">{img.url}</p>
                                     <p className="text-[10px] text-slate-400 mt-0.5">Slide {idx + 1}</p>
                                   </div>
                                   <button
                                     type="button"
                                     onClick={async () => {
                                       let curr = [];
                                       try { curr = JSON.parse(appSettings.heroImages || '[]'); } catch {}
                                       const updated = curr.filter((_, i) => i !== idx);
                                       const newSettings = {...appSettings, heroImages: JSON.stringify(updated)};
                                       setAppSettings(newSettings);
                                       await updateSettings(newSettings);
                                     }}
                                     className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                                   >
                                     <Trash size={16} />
                                   </button>
                                 </div>
                               ));
                             })()}
                           </div>

                           {/* Upload */}
                           <label className="flex items-center justify-center gap-3 w-full py-4 border-2 border-dashed border-blue-300 bg-blue-50 rounded-2xl cursor-pointer hover:bg-blue-100 transition font-black text-blue-700 text-sm">
                             <ImageIcon size={18} />
                             <span>Click to Upload New Slide</span>
                             <input
                               type="file"
                               accept="image/*"
                               className="hidden"
                               onChange={async (e) => {
                                 const file = e.target.files?.[0];
                                 if (!file) return;
                                 try {
                                   const url = await uploadImage(file);
                                   let curr = [];
                                   try { curr = JSON.parse(appSettings.heroImages || '[]'); } catch {}
                                   const newItem = { id: Date.now().toString(), url };
                                   const newSettings = {...appSettings, heroImages: JSON.stringify([...curr, newItem])};
                                   setAppSettings(newSettings);
                                   await updateSettings(newSettings);
                                   e.target.value = '';
                                   alert('✅ Slide uploaded and saved!');
                                 } catch(err) {
                                   alert('Upload failed: ' + err.message);
                                 }
                               }}
                             />
                           </label>
                         </div>

                         {/* Promo Cards */}
                         <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm">
                           <h3 className="font-black text-slate-800 text-lg mb-1 flex items-center gap-2"><ImageIcon size={20} className="text-purple-500" /> Promo Cards (below Flash Sale)</h3>
                           <p className="text-xs text-slate-400 font-bold mb-5 uppercase tracking-widest">4 promotional image cards shown inside the Flash Sale section</p>

                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                             {(() => {
                               let cards = [];
                               try { cards = JSON.parse(appSettings.homePromoCards || '[]'); } catch {}
                               const slots = [...cards];
                               while (slots.length < 4) slots.push(null);
                               return slots.slice(0, 4).map((card, idx) => (
                                 <div key={card?.id || `slot-${idx}`}>
                                   {card ? (
                                     <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 group" style={{ aspectRatio: '3/2' }}>
                                       <img src={card.url} className="w-full h-full object-cover" alt="" />
                                       <button
                                         type="button"
                                         onClick={async () => {
                                           let curr = [];
                                           try { curr = JSON.parse(appSettings.homePromoCards || '[]'); } catch {}
                                           const updated = curr.filter(c => c.id !== card.id);
                                           const newSettings = {...appSettings, homePromoCards: JSON.stringify(updated)};
                                           setAppSettings(newSettings);
                                           await updateSettings(newSettings);
                                         }}
                                         className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                                       >
                                         <Trash size={20} className="text-white" />
                                       </button>
                                       <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] font-black px-1.5 py-0.5 rounded">Card {idx+1}</span>
                                     </div>
                                   ) : (
                                     <label className="flex flex-col items-center justify-center gap-1 w-full border-2 border-dashed border-purple-200 bg-purple-50/60 rounded-2xl cursor-pointer hover:bg-purple-100 transition text-purple-400" style={{ aspectRatio: '3/2' }}>
                                       <Plus size={22} />
                                       <span className="text-[10px] font-black uppercase">Card {idx+1}</span>
                                       <input
                                         type="file"
                                         accept="image/*"
                                         className="hidden"
                                         onChange={async (e) => {
                                           const file = e.target.files?.[0];
                                           if (!file) return;
                                           try {
                                             const url = await uploadImage(file);
                                             let curr = [];
                                             try { curr = JSON.parse(appSettings.homePromoCards || '[]'); } catch {}
                                             const newItem = { id: Date.now().toString(), url };
                                             const newSettings = {...appSettings, homePromoCards: JSON.stringify([...curr, newItem])};
                                             setAppSettings(newSettings);
                                             await updateSettings(newSettings);
                                             e.target.value = '';
                                           } catch(err) {
                                             alert('Upload failed: ' + err.message);
                                           }
                                         }}
                                       />
                                     </label>
                                   )}
                                 </div>
                               ));
                             })()}
                           </div>
                           <p className="text-[11px] text-slate-400 font-bold">Click the + slot to upload. Hover image to delete. Saves automatically.</p>
                         </div>

                         {/* Delivery Section Image */}
                         <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm">
                           <h3 className="font-black text-slate-800 text-lg mb-1 flex items-center gap-2"><Truck size={20} className="text-emerald-500" /> Delivery Trust Section Image</h3>
                           <p className="text-xs text-slate-400 font-bold mb-5 uppercase tracking-widest">Image shown on the right side of the Quality & Trust section</p>
                           <div className="flex gap-4 items-start">
                             <div className="flex-1">
                               <label className="flex items-center justify-center gap-3 w-full py-4 border-2 border-dashed border-emerald-300 bg-emerald-50 rounded-2xl cursor-pointer hover:bg-emerald-100 transition font-black text-emerald-700 text-sm mb-3">
                                 <ImageIcon size={18} />
                                 <span>Upload Delivery Image</span>
                                 <input
                                   type="file"
                                   accept="image/*"
                                   className="hidden"
                                   onChange={async (e) => {
                                     const file = e.target.files?.[0];
                                     if (!file) return;
                                     try {
                                       const url = await uploadImage(file);
                                       const newSettings = {...appSettings, deliverySectionImage: url};
                                       setAppSettings(newSettings);
                                       await updateSettings(newSettings);
                                       alert('✅ Delivery section image uploaded!');
                                       e.target.value = '';
                                     } catch(err) {
                                       alert('Upload failed: ' + err.message);
                                     }
                                   }}
                                 />
                               </label>
                               <p className="text-xs text-slate-400">Or paste a URL directly:</p>
                               <input
                                 type="text"
                                 value={appSettings.deliverySectionImage || ''}
                                 onChange={e => setAppSettings({...appSettings, deliverySectionImage: e.target.value})}
                                 className="w-full mt-1 px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-emerald-400 outline-none font-bold text-sm"
                                 placeholder="https://..."
                               />
                             </div>
                             {appSettings.deliverySectionImage && (
                               <div className="w-32 h-24 rounded-xl overflow-hidden border-2 border-slate-200 flex-shrink-0">
                                 <img src={appSettings.deliverySectionImage} className="w-full h-full object-cover" alt="" />
                               </div>
                             )}
                           </div>
                           {appSettings.deliverySectionImage && (
                             <button
                               type="button"
                               onClick={async () => {
                                 const newSettings = {...appSettings, deliverySectionImage: ''};
                                 setAppSettings(newSettings);
                                 await updateSettings(newSettings);
                               }}
                               className="mt-3 text-xs text-red-500 font-black hover:underline"
                             >
                               Remove image
                             </button>
                           )}
                         </div>

                         {/* Save all */}
                         <button
                           onClick={async () => {
                             try {
                               await updateSettings(appSettings);
                               alert('✅ Media settings saved!');
                             } catch(e) {
                               alert('Failed: ' + e.message);
                             }
                           }}
                           className="w-full bg-[var(--secondary)] text-white py-4 rounded-2xl font-black shadow-lg hover:opacity-90 transition"
                         >
                           Save All Media Settings
                         </button>
                       </div>
                     </div>
                   )}

"""

# Find the insertion point — just before the closing of the tab content area
# Looking for: "                 </>\n               )}\n            </div>"
insert_before = "                 </>"
idx = content.rfind(insert_before)
if idx != -1:
    content = content[:idx] + media_tab + content[idx:]
    print('DONE: Added Media Manager tab content')
else:
    print('WARN: Could not find closing </> for tab area')

with open('frontend/src/pages/Admin.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('\nFile saved.')
