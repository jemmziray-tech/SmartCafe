import React from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Minus, Plus, CreditCard } from 'lucide-react';

export default function Cart() {
  const { cart, updateCartQuantity, removeFromCart, cartTotal, placeOrder } = useStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    placeOrder();
    alert('Order placed successfully! Track it in your profile.');
    navigate('/profile');
  };

  const total = cartTotal();
  // Using 18% standard VAT rate for Tanzania instead of 10%
  const tax = total * 0.18; 
  const grandTotal = total + tax;

  return (
    <div className="absolute inset-0 z-20 flex flex-col h-full bg-natural-light dark:bg-natural-dark pb-20">
      <header className="flex items-center px-4 py-4 bg-natural-light/50 dark:bg-natural-dark/50 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full text-natural-dark dark:text-natural-light">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold ml-2 text-natural-dark dark:text-natural-light font-serif">My Order</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-20 h-20 bg-natural-cream dark:bg-white/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🛒</span>
            </div>
            <p className="font-medium">Your cart is empty</p>
            <button 
              onClick={() => navigate('/menu')}
              className="mt-6 text-natural-accent font-semibold"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.product.id} className="flex gap-4 bg-natural-base dark:bg-natural-dark p-3 rounded-3xl shadow-sm border border-natural-cream dark:border-white/10">
                <div className="w-20 h-20 shrink-0 bg-natural-cream rounded-2xl overflow-hidden flex items-center justify-center">
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm text-natural-dark dark:text-natural-light line-clamp-1">{item.product.name}</h3>
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {/* TZS Formatting */}
                  <span className="font-bold text-natural-accent">
                    TZS {(item.product.price * item.quantity).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => item.quantity > 1 ? updateCartQuantity(item.product.id, item.quantity - 1) : removeFromCart(item.product.id)}
                      className="w-7 h-7 flex items-center justify-center bg-natural-light dark:bg-white/10 rounded-full text-gray-500 dark:text-gray-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-semibold w-4 text-center dark:text-natural-light">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center bg-natural-cream dark:bg-white/20 rounded-full text-natural-accent"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-natural-base dark:bg-natural-dark p-5 rounded-3xl mt-8 shadow-sm border border-natural-cream dark:border-white/10">
              <h3 className="font-bold mb-4 dark:text-natural-light">Payment Summary</h3>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-natural-dark dark:text-natural-light">TZS {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (18%)</span>
                  <span className="font-medium text-natural-dark dark:text-natural-light">TZS {tax.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-natural-cream dark:border-white/10 flex justify-between font-bold text-lg text-natural-dark dark:text-natural-accent">
                  <span>Total</span>
                  <span>TZS {grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="absolute bottom-0 w-full p-4 bg-natural-light dark:bg-natural-dark border-t border-natural-cream dark:border-white/10 flex flex-col gap-2 z-30">
          <button 
            onClick={handleCheckout}
            className="w-full bg-natural-accent text-white py-4 rounded-3xl font-bold flex justify-center items-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
          >
            <CreditCard className="w-5 h-5" />
            Checkout - TZS {grandTotal.toLocaleString()}
          </button>
        </div>
      )}
    </div>
  );
}