import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CheckoutStep {
  title: string;
  component: React.FC<any>;
}

const ShippingForm: React.FC = () => (
  <div className="space-y-4">
    <div>
      <label className="form-label">Full Name</label>
      <input type="text" className="input" placeholder="John Doe" />
    </div>
    <div>
      <label className="form-label">Address</label>
      <input type="text" className="input" placeholder="Street Address" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="form-label">City</label>
        <input type="text" className="input" placeholder="City" />
      </div>
      <div>
        <label className="form-label">Postal Code</label>
        <input type="text" className="input" placeholder="Postal Code" />
      </div>
    </div>
  </div>
);

const PaymentForm: React.FC = () => (
  <div className="space-y-4">
    <div>
      <label className="form-label">Card Number</label>
      <input 
        type="text" 
        className="input" 
        placeholder="1234 5678 9012 3456"
        maxLength={19}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="form-label">Expiry Date</label>
        <input 
          type="text" 
          className="input" 
          placeholder="MM/YY"
          maxLength={5}
        />
      </div>
      <div>
        <label className="form-label">CVV</label>
        <input 
          type="text" 
          className="input" 
          placeholder="123"
          maxLength={3}
        />
      </div>
    </div>
  </div>
);

const ReviewOrder: React.FC = () => (
  <div className="space-y-4">
    <div className="card p-4">
      <h3 className="text-heading mb-2">Order Summary</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-body">Subtotal</span>
          <span className="text-body">$99.99</span>
        </div>
        <div className="flex justify-between">
          <span className="text-body">Shipping</span>
          <span className="text-body">$4.99</span>
        </div>
        <div className="divider"></div>
        <div className="flex justify-between font-semibold">
          <span className="text-heading">Total</span>
          <span className="text-heading">$104.98</span>
        </div>
      </div>
    </div>
  </div>
);

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps: CheckoutStep[] = [
    { title: 'Shipping', component: ShippingForm },
    { title: 'Payment', component: PaymentForm },
    { title: 'Review', component: ReviewOrder },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle order completion
      navigate('/order-confirmation');
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="container py-8 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${index <= currentStep ? 'bg-white text-mono-900' : 'bg-mono-800 text-gray-400'}
                transition-colors duration-200
              `}>
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-24 h-0.5 mx-2
                  ${index < currentStep ? 'bg-white' : 'bg-mono-800'}
                  transition-colors duration-200
                `} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6">{steps[currentStep].title}</h2>
          <CurrentStepComponent />
          
          <div className="mt-8 flex justify-between">
            {currentStep > 0 && (
              <button 
                className="btn btn-secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Back
              </button>
            )}
            <button 
              className="btn btn-primary ml-auto"
              onClick={handleNext}
            >
              {currentStep === steps.length - 1 ? 'Place Order' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 