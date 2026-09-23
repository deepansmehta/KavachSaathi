import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DigitalCard, CardOrder, InventoryCard } from '../types';

interface CardsState {
  digitalCards: DigitalCard[];
  orders: CardOrder[];
  /** Local DEV inventory of ready cards */
  inventory: InventoryCard[];
  setDigitalCards: (cards: DigitalCard[]) => void;
  addDigitalCard: (card: DigitalCard) => void;
  updateDigitalCard: (cardId: string, patch: Partial<DigitalCard>) => void;
  addOrder: (order: CardOrder) => void;
  updateOrder: (orderId: string, patch: Partial<CardOrder>) => void;
  setInventory: (cards: InventoryCard[]) => void;
  takeReadyCard: (type: 'standard' | 'pro') => InventoryCard | null;
  seedDevInventory: () => void;
  hasAnyCard: () => boolean;
}

function makeDevCard(type: 'standard' | 'pro'): InventoryCard {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  const cardId = `KVS-${year}-${suffix}`;
  return {
    cardId,
    type,
    status: 'ready',
    assignedTo: null,
    orderId: null,
    activatedAt: null,
    memberLinked: null,
    qrToken: Math.random().toString(36).slice(2, 18),
    createdAt: Date.now(),
  };
}

export const useCardsStore = create<CardsState>()(
  persist(
    (set, get) => ({
      digitalCards: [],
      orders: [],
      inventory: [],
      setDigitalCards: (digitalCards) => set({ digitalCards }),
      addDigitalCard: (card) =>
        set((s) => ({
          digitalCards: [card, ...s.digitalCards.filter((c) => c.cardId !== card.cardId)],
        })),
      updateDigitalCard: (cardId, patch) =>
        set((s) => ({
          digitalCards: s.digitalCards.map((c) =>
            c.cardId === cardId ? { ...c, ...patch } : c,
          ),
        })),
      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
      updateOrder: (orderId, patch) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.orderId === orderId ? { ...o, ...patch } : o)),
        })),
      setInventory: (inventory) => set({ inventory }),
      takeReadyCard: (type) => {
        const { inventory } = get();
        const idx = inventory.findIndex((c) => c.type === type && c.status === 'ready');
        if (idx < 0) return null;
        const card = inventory[idx];
        set({
          inventory: inventory.map((c, i) =>
            i === idx ? { ...c, status: 'shipped' as const } : c,
          ),
        });
        return card;
      },
      seedDevInventory: () => {
        if (get().inventory.length > 0) return;
        const std = Array.from({ length: 20 }, () => makeDevCard('standard'));
        const pro = Array.from({ length: 10 }, () => makeDevCard('pro'));
        set({ inventory: [...std, ...pro] });
      },
      hasAnyCard: () => get().digitalCards.length > 0,
    }),
    {
      name: 'kavach-cards',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        digitalCards: s.digitalCards,
        orders: s.orders,
        inventory: s.inventory,
      }),
    },
  ),
);
