'use client';

// Adoption Store - Following existing patterns from cartStore.ts
// SSR-safe Zustand store with individual hooks for performance

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AdoptableItem, Adoption, AdoptionPlan } from '@/lib/api/models/adoption/types';

// ===== STORE INTERFACE =====
interface AdoptionStore {
  // Selection state
  selectedItem: AdoptableItem | null;
  selectedPlan: AdoptionPlan | null;
  
  // UI state
  isAdoptionFlowOpen: boolean;
  currentStep: 'select-item' | 'select-plan' | 'payment' | 'confirmation';
  
  // User adoptions cache
  userAdoptions: Adoption[];
  
  // Actions
  selectItem: (item: AdoptableItem) => void;
  selectPlan: (plan: AdoptionPlan) => void;
  clearSelection: () => void;
  
  // Flow control
  openAdoptionFlow: (item?: AdoptableItem) => void;
  closeAdoptionFlow: () => void;
  setCurrentStep: (step: AdoptionStore['currentStep']) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // User adoptions
  setUserAdoptions: (adoptions: Adoption[]) => void;
  addAdoption: (adoption: Adoption) => void;
  updateAdoption: (id: number, updates: Partial<Adoption>) => void;
}

// ===== STORE IMPLEMENTATION =====
const useAdoptionStore = create<AdoptionStore>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedItem: null,
      selectedPlan: null,
      isAdoptionFlowOpen: false,
      currentStep: 'select-item',
      userAdoptions: [],

      // Selection actions
      selectItem: (item) => {
        set({ 
          selectedItem: item, 
          selectedPlan: null, // Reset plan when item changes
          currentStep: 'select-plan' 
        });
      },

      selectPlan: (plan) => {
        set({ 
          selectedPlan: plan,
          currentStep: 'payment'
        });
      },

      clearSelection: () => {
        set({
          selectedItem: null,
          selectedPlan: null,
          currentStep: 'select-item'
        });
      },

      // Flow control
      openAdoptionFlow: (item) => {
        set({
          isAdoptionFlowOpen: true,
          selectedItem: item || null,
          currentStep: item ? 'select-plan' : 'select-item'
        });
      },

      closeAdoptionFlow: () => {
        set({
          isAdoptionFlowOpen: false,
          currentStep: 'select-item'
        });
      },

      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      nextStep: () => {
        const { currentStep } = get();
        const steps: AdoptionStore['currentStep'][] = ['select-item', 'select-plan', 'payment', 'confirmation'];
        const currentIndex = steps.indexOf(currentStep);
        
        if (currentIndex < steps.length - 1) {
          set({ currentStep: steps[currentIndex + 1] });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        const steps: AdoptionStore['currentStep'][] = ['select-item', 'select-plan', 'payment', 'confirmation'];
        const currentIndex = steps.indexOf(currentStep);
        
        if (currentIndex > 0) {
          set({ currentStep: steps[currentIndex - 1] });
        }
      },

      // User adoptions management
      setUserAdoptions: (adoptions) => {
        set({ userAdoptions: adoptions });
      },

      addAdoption: (adoption) => {
        set((state) => ({
          userAdoptions: [adoption, ...state.userAdoptions]
        }));
      },

      updateAdoption: (id, updates) => {
        set((state) => ({
          userAdoptions: state.userAdoptions.map(adoption =>
            adoption.id === id ? { ...adoption, ...updates } : adoption
          )
        }));
      }
    }),
    {
      name: 'adoption-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist user adoptions, not UI state
        userAdoptions: state.userAdoptions
      })
    }
  )
);

// ===== INDIVIDUAL HOOKS FOR PERFORMANCE =====

/**
 * Hook for selected item and plan
 */
export const useAdoptionSelection = () => {
  return useAdoptionStore((state) => ({
    selectedItem: state.selectedItem,
    selectedPlan: state.selectedPlan,
    selectItem: state.selectItem,
    selectPlan: state.selectPlan,
    clearSelection: state.clearSelection
  }));
};

/**
 * Hook for adoption flow state
 */
export const useAdoptionFlow = () => {
  return useAdoptionStore((state) => ({
    isOpen: state.isAdoptionFlowOpen,
    currentStep: state.currentStep,
    openFlow: state.openAdoptionFlow,
    closeFlow: state.closeAdoptionFlow,
    setStep: state.setCurrentStep,
    nextStep: state.nextStep,
    previousStep: state.previousStep
  }));
};

/**
 * Hook for user adoptions
 */
export const useUserAdoptionsStore = () => {
  return useAdoptionStore((state) => ({
    adoptions: state.userAdoptions,
    setAdoptions: state.setUserAdoptions,
    addAdoption: state.addAdoption,
    updateAdoption: state.updateAdoption
  }));
};

/**
 * Hook for adoption actions
 */
export const useAdoptionActions = () => {
  return useAdoptionStore((state) => ({
    selectItem: state.selectItem,
    selectPlan: state.selectPlan,
    clearSelection: state.clearSelection,
    openFlow: state.openAdoptionFlow,
    closeFlow: state.closeAdoptionFlow,
    nextStep: state.nextStep,
    previousStep: state.previousStep
  }));
};

// Export the main store for direct access if needed
export { useAdoptionStore };
export default useAdoptionStore;
