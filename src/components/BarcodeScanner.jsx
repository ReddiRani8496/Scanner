// // src/components/BarcodeScanner.jsx
// import { useRef, useState } from "react";
// import Webcam from "react-webcam";
// import { BrowserMultiFormatReader } from "@zxing/library";
// import { toast } from "sonner";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import { productApi, cartApi } from "../services/api";

// export default function BarcodeScanner() {
//   const webcamRef = useRef(null);
//   const [scanning, setScanning] = useState(false);
//   const [facingMode, setFacingMode] = useState("environment");
//   const [newProduct, setNewProduct] = useState(null);
//   const [cart, setCart] = useState({ items: [], total: 0 });
//   const [products, setProducts] = useState([]);

//   const fetchProducts = async () => {
//     try {
//       const response = await productApi.getAllProducts();
//       setProducts(response.data);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//       toast.error("Failed to fetch products");
//     }
//   };

//   const handleStartScanning = () => {
//     setScanning(true);
//     const codeReader = new BrowserMultiFormatReader();
//     codeReader.decodeFromVideoDevice(
//       null,
//       webcamRef?.current?.video,
//       async (result, err) => {
//         if (result) {
//           const code = result.getText();
//           try {
//             const response = await productApi.getByCode(code);
//             if (response.data) {
//               const cartResponse = await cartApi.addToCart("user123", code);
//               setCart(cartResponse.data);
//               toast.success("Product added to cart!");
//             }
//           } catch (error) {
//             console.error("Error adding to cart:", error);
//             setNewProduct({
//               code,
//               name: "",
//               description: "",
//               mrp: 0,
//               discount: 0,
//             });
//             setScanning(false);
//           }
//         }
//       }
//     );
//   };

//   const handleStopScanning = () => {
//     setScanning(false);
//   };

//   const handleSwitchCamera = () => {
//     setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
//   };

//   const handleAddProduct = async (e) => {
//     e.preventDefault();
//     if (!newProduct) return;

//     try {
//       await productApi.addProduct(newProduct);
//       const cartResponse = await cartApi.addToCart("user123", newProduct.code);
//       setCart(cartResponse.data);
//       toast.success("Product added successfully!");
//       setNewProduct(null);
//       fetchProducts(); // Refresh products list
//     } catch (error) {
//       toast.error("Failed to add product");
//     }
//   };

//   const handleUpdateQuantity = async (code, quantity) => {
//     try {
//       const response = await cartApi.updateQuantity("user123", code, quantity);
//       setCart(response.data);
//     } catch (error) {
//       toast.error("Failed to update quantity");
//     }
//   };

//   const handleRemoveFromCart = async (code) => {
//     try {
//       const response = await cartApi.updateQuantity("user123", code, 0);
//       setCart(response.data);
//     } catch (error) {
//       toast.error("Failed to remove item");
//     }
//   };

//   const generatePDF = () => {
//     if (!cart || cart.items.length === 0) return;

//     const doc = new jsPDF();

//     // Add header
//     doc.setFontSize(20);
//     doc.text("🛒 GROCERY SHOP RECEIPT", 20, 20);
//     doc.setFontSize(12);
//     doc.text(new Date().toLocaleString(), 20, 30);

//     // Calculate totals
//     const totalMRP = cart.items.reduce(
//       (sum, item) => sum + item.mrp * item.quantity,
//       0
//     );
//     const totalDiscount = cart.items.reduce(
//       (sum, item) => sum + item.mrp * (item.discount / 100) * item.quantity,
//       0
//     );
//     const finalTotal = totalMRP - totalDiscount;

//     // Add items table
//     const tableData = cart.items.map((item) => [
//       item.name,
//       `₹${item.mrp.toFixed(2)}`,
//       `${item.discount}%`,
//       item.quantity.toString(),
//       `₹${(item.mrp * (item.discount / 100) * item.quantity).toFixed(2)}`,
//     ]);

//     doc.autoTable({
//       head: [
//         [
//           "Item Name",
//           "MRP (₹)",
//           "Discount (%)",
//           "Quantity",
//           "Discount Amount (₹)",
//         ],
//       ],
//       body: tableData,
//       startY: 40,
//       theme: "grid",
//       headStyles: { fillColor: [66, 66, 66] },
//       styles: { fontSize: 10 },
//       columnStyles: {
//         0: { cellWidth: 50 },
//         1: { cellWidth: 30 },
//         2: { cellWidth: 30 },
//         3: { cellWidth: 30 },
//         4: { cellWidth: 40 },
//       },
//     });

//     // Add totals
//     const finalY = doc.lastAutoTable.finalY + 10;
//     doc.text(`Total Discount: ₹${totalDiscount.toFixed(2)}`, 20, finalY);
//     doc.text(
//       `Total Amount Before Discount: ₹${totalMRP.toFixed(2)}`,
//       20,
//       finalY + 10
//     );
//     doc.text(
//       `Total Amount Payable: ₹${finalTotal.toFixed(2)}`,
//       20,
//       finalY + 20
//     );

//     // Add footer
//     doc.text("🧾 Thank you for shopping with us!", 20, finalY + 30);

//     // Save PDF
//     doc.save("grocery-receipt.pdf");

//     // Clear cart after generating receipt
//     cartApi
//       .clearCart("user123")
//       .then(() => {
//         setCart({ items: [], total: 0 });
//         toast.success("Receipt generated and cart cleared!");
//       })
//       .catch(() => toast.error("Failed to clear cart"));
//   };

//   return (
//     <div className="flex flex-col items-center gap-4 p-4 min-h-screen bg-gray-50">
//       {products && products.length > 0 && (
//         <div className="w-full max-w-md bg-white rounded-lg shadow p-4 mb-4">
//           <h3 className="font-bold mb-2">Available Products:</h3>
//           <ul className="text-sm">
//             {products.map((product) => (
//               <li key={product.code}>
//                 {product.code} - {product.name} - ₹{product.mrp}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {newProduct ? (
//         <div className="w-full max-w-md bg-white rounded-lg shadow p-4">
//           <h3 className="font-bold mb-4">Add New Product</h3>
//           <form onSubmit={handleAddProduct} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Barcode</label>
//               <input
//                 type="text"
//                 value={newProduct.code}
//                 readOnly
//                 className="w-full p-2 border rounded bg-gray-100"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Product Name
//               </label>
//               <input
//                 type="text"
//                 value={newProduct.name}
//                 onChange={(e) =>
//                   setNewProduct({ ...newProduct, name: e.target.value })
//                 }
//                 className="w-full p-2 border rounded"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Description
//               </label>
//               <input
//                 type="text"
//                 value={newProduct.description}
//                 onChange={(e) =>
//                   setNewProduct({ ...newProduct, description: e.target.value })
//                 }
//                 className="w-full p-2 border rounded"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">MRP (₹)</label>
//               <input
//                 type="number"
//                 value={newProduct.mrp}
//                 onChange={(e) =>
//                   setNewProduct({
//                     ...newProduct,
//                     mrp: parseFloat(e.target.value),
//                   })
//                 }
//                 className="w-full p-2 border rounded"
//                 required
//                 min="0"
//                 step="0.01"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Discount (%)
//               </label>
//               <input
//                 type="number"
//                 value={newProduct.discount}
//                 onChange={(e) =>
//                   setNewProduct({
//                     ...newProduct,
//                     discount: parseFloat(e.target.value),
//                   })
//                 }
//                 className="w-full p-2 border rounded"
//                 required
//                 min="0"
//                 max="100"
//                 step="0.1"
//               />
//             </div>
//             <div className="flex gap-2">
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-green-500 text-white rounded"
//               >
//                 Add Product
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setNewProduct(null);
//                   setScanning(true);
//                 }}
//                 className="px-4 py-2 bg-gray-500 text-white rounded"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       ) : (
//         <>
//           <div className="flex gap-2 mb-4">
//             <button
//               className="px-4 py-2 bg-blue-500 text-white rounded"
//               onClick={scanning ? handleStopScanning : handleStartScanning}
//             >
//               {scanning ? "Stop Scanning" : "Start Scanning"}
//             </button>
//             <button
//               className="px-4 py-2 bg-orange-500 text-white rounded"
//               onClick={handleSwitchCamera}
//             >
//               Switch Camera
//             </button>
//           </div>

//           <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden bg-black">
//             <Webcam
//               ref={webcamRef}
//               className="w-full h-full object-cover"
//               videoConstraints={{
//                 facingMode,
//                 width: { min: 640, ideal: 1280, max: 1920 },
//                 height: { min: 480, ideal: 720, max: 1080 },
//               }}
//               mirrored={facingMode === "user"}
//             />
//             {scanning && (
//               <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
//                 <div className="w-64 h-64 border-4 border-white rounded-lg"></div>
//               </div>
//             )}
//           </div>
//         </>
//       )}

//       {cart && cart.items.length > 0 && (
//         <div className="w-full max-w-md bg-white rounded-lg shadow p-4 mt-4">
//           <h3 className="font-bold mb-2 sticky top-0 bg-white">
//             Shopping Cart
//           </h3>
//           <div className="max-h-60 overflow-y-auto">
//             {cart.items.map((item) => (
//               <div
//                 key={item.code}
//                 className="flex items-center justify-between py-2 border-b"
//               >
//                 <div>
//                   <div className="font-medium">{item.name}</div>
//                   <div className="text-sm text-gray-600">
//                     ₹{item.mrp} {item.discount > 0 && `(-${item.discount}%)`}
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() =>
//                       handleUpdateQuantity(item.code, item.quantity - 1)
//                     }
//                     className="px-2 py-1 bg-gray-200 rounded"
//                   >
//                     -
//                   </button>
//                   <span className="w-8 text-center">{item.quantity}</span>
//                   <button
//                     onClick={() =>
//                       handleUpdateQuantity(item.code, item.quantity + 1)
//                     }
//                     className="px-2 py-1 bg-gray-200 rounded"
//                   >
//                     +
//                   </button>
//                   <button
//                     onClick={() => handleRemoveFromCart(item.code)}
//                     className="px-2 py-1 bg-red-500 text-white rounded ml-2"
//                   >
//                     Remove
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="mt-4 pt-4 border-t">
//             <div className="flex justify-between font-bold">
//               <span>Total:</span>
//               <span>₹{cart.total.toFixed(2)}</span>
//             </div>
//             <button
//               onClick={generatePDF}
//               className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded"
//             >
//               Generate Bill
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// src/components/BarcodeScanner.jsx
import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { BrowserMultiFormatReader } from "@zxing/library";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { productApi, cartApi } from "../services/api";

export default function BarcodeScanner() {
  const webcamRef = useRef(null);
  const codeReaderRef = useRef(null); // NEW: for managing scanner instance
  const [scanning, setScanning] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [newProduct, setNewProduct] = useState(null);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [products, setProducts] = useState([]);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productApi.getAllProducts();
      console.log("response ", response);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    }
  };

  // Start scanning
  // const handleStartScanning = () => {
  //   setScanning(true);
  //   console.log("insde handle start scanning");

  //   setTimeout(() => {
  //     const video = webcamRef.current && webcamRef.current.video;
  //     console.log("video ", video);

  //     if (!video || video.readyState !== 4) {
  //       toast.error("Camera not ready");
  //       setScanning(false);
  //       return;
  //     }
  //     // Clean up any previous reader
  //     if (codeReaderRef.current) {
  //       codeReaderRef.current.reset();
  //     }

  //     const codeReader = new BrowserMultiFormatReader();
  //     codeReaderRef.current = codeReader;
  //     console.log("line 452");
  //     codeReader.decodeFromVideoDevice(video, async (result, err) => {
  //       console.log("outside if result ", result);
  //       if (result) {
  //         console.log("result inside if ", result);
  //         const code = result.getText();
  //         try {
  //           const response = await productApi.getByCode(code);
  //           if (response.data) {
  //             const cartResponse = await cartApi.addToCart("user123", code);
  //             setCart(cartResponse.data);
  //             toast.success("Product added to cart!");
  //             setScanning(false);
  //             codeReader.reset();
  //             codeReaderRef.current = null;
  //           }
  //         } catch (error) {
  //           console.error("Error adding to cart:", error);
  //           setNewProduct({
  //             code,
  //             name: "",
  //             description: "",
  //             mrp: 0,
  //             discount: 0,
  //           });
  //           setScanning(false);
  //           codeReader.reset();
  //           codeReaderRef.current = null;
  //         }
  //       }
  //     });
  //   }, 1500); // Wait for video to be ready
  // };

  const handleStartScanning = () => {
    setScanning(true);
    console.log("inside handle start scanning");
    const codeReader = new BrowserMultiFormatReader();
    codeReader.decodeFromVideoDevice(
      null,
      webcamRef?.current?.video,
      async (result, err) => {
        console.log("inside decode", result, "err ", err);
        if (result) {
          console.log("inside result if");
          const code = result.getText();
          try {
            const response = await productApi.getByCode(code);
            console.log("inside try block response");
            alert("resp ", response);
            if (response.data) {
              const cartResponse = await cartApi.addToCart("user123", code);
              console.log("cart response ", cartResponse);
              alert("cart response", cartResponse);
              setCart(cartResponse.data);
              toast.success("Product added to cart!");
            }
          } catch (error) {
            console.error("Error adding to cart:", error);
            setNewProduct({
              code,
              name: "",
              description: "",
              mrp: 0,
              discount: 0,
            });
            setScanning(false);
          }
        }
      }
    );
  };
  // Stop scanning
  const handleStopScanning = () => {
    setScanning(false);
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
  };

  // Switch camera
  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Add new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct) return;

    try {
      await productApi.addProduct(newProduct);
      const cartResponse = await cartApi.addToCart("user123", newProduct.code);
      setCart(cartResponse.data);
      toast.success("Product added successfully!");
      setNewProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error("Failed to add product");
    }
  };

  // Update quantity
  const handleUpdateQuantity = async (code, quantity) => {
    try {
      const response = await cartApi.updateQuantity("user123", code, quantity);
      setCart(response.data);
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  // Remove from cart
  const handleRemoveFromCart = async (code) => {
    try {
      const response = await cartApi.updateQuantity("user123", code, 0);
      setCart(response.data);
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  // Generate PDF bill
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Shopping Bill", 14, 16);
    doc.autoTable({
      startY: 24,
      head: [["Product", "MRP", "Discount (%)", "Qty", "Total"]],
      body: cart.items.map((item) => [
        item.name,
        `₹${item.mrp}`,
        item.discount,
        item.quantity,
        `₹${(item.mrp * item.quantity * (1 - item.discount / 100)).toFixed(2)}`,
      ]),
    });
    doc.text(
      `Grand Total: ₹${cart.total.toFixed(2)}`,
      14,
      doc.lastAutoTable.finalY + 10
    );
    doc.save("bill.pdf");
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 min-h-screen bg-gray-50">
      {products && products.length > 0 && (
        <div className="w-full max-w-md bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="font-bold mb-2">Available Products:</h3>
          <ul className="text-sm">
            {products.map((product) => (
              <li key={product.code}>
                {product.code} - {product.name} - ₹{product.mrp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {newProduct ? (
        <div className="w-full max-w-md bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-4">Add New Product</h3>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Barcode</label>
              <input
                type="text"
                value={newProduct.code}
                readOnly
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <input
                type="text"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">MRP (₹)</label>
              <input
                type="number"
                value={newProduct.mrp}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    mrp: parseFloat(e.target.value),
                  })
                }
                className="w-full p-2 border rounded"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                value={newProduct.discount}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    discount: parseFloat(e.target.value),
                  })
                }
                className="w-full p-2 border rounded"
                required
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Add Product
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewProduct(null);
                  setScanning(true);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={scanning ? handleStopScanning : handleStartScanning}
            >
              {scanning ? "Stop Scanning" : "Start Scanning"}
            </button>
            <button
              className="px-4 py-2 bg-orange-500 text-white rounded"
              onClick={handleSwitchCamera}
            >
              Switch Camera
            </button>
          </div>

          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
            <Webcam
              ref={webcamRef}
              style={{ width: "100%", height: "auto" }}
              videoConstraints={{ facingMode }}
              mirrored={facingMode === "user"}
            />
            {scanning && (
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-white rounded-lg"></div>
              </div>
            )}
          </div>
        </>
      )}

      {cart && cart.items.length > 0 && (
        <div className="w-full max-w-md bg-white rounded-lg shadow p-4 mt-4">
          <h3 className="font-bold mb-2 sticky top-0 bg-white">
            Shopping Cart
          </h3>
          <div className="max-h-60 overflow-y-auto">
            {cart.items.map((item) => (
              <div
                key={item.code}
                className="flex items-center justify-between py-2 border-b"
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    ₹{item.mrp} {item.discount > 0 && `(-${item.discount}%)`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.code, item.quantity - 1)
                    }
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.code, item.quantity + 1)
                    }
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleRemoveFromCart(item.code)}
                    className="px-2 py-1 bg-red-500 text-white rounded ml-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>₹{cart.total.toFixed(2)}</span>
            </div>
            <button
              onClick={generatePDF}
              className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded"
            >
              Generate Bill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
