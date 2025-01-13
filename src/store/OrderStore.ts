import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Order } from "../interface/order";
import { v4 as uuidv4 } from "uuid";
import { Bot } from "../interface/bot";


/**
 * References:
 * https://medium.com/globant/react-state-management-b0c81e0cbbf3
 * Difference between Zustand and Redux
 * Sample Usage of Zustand
 */

interface OrderState {
  orderNumber: number;
  pendingOrders: Order[];
  completedOrders: Order[];
  addOrder: (
    order: Omit<Order, "id" | "createdAt" | "updatedAt" | "orderNumber">
  ) => void;
  removeOrder: (id: string) => void;
  completeOrder: (id: string) => void;

  numbersOfBots: number;
  bots: Bot[];
  addBot: () => void;
  removeBot: () => void;
  processOrder: (botId: string) => void;
}

export const useOrderStore = create(
  persist<OrderState>(
    (set, get) => ({
      orderNumber: 0,
      pendingOrders: [],
      completedOrders: [],

      // Add a new order
      addOrder: (order) =>
        set((state) => {
          const newOrder: Order = {
            ...order,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            orderNumber: state.orderNumber + 1,
            status: "PENDING",
            orderProcessingTime: 10,
          };

          const updatedPendingOrders = [...state.pendingOrders];
          if (order.type === "VIP") {
            const nonVIPIndex = updatedPendingOrders.findIndex(
              (o) => o.type !== "VIP"
            );
            if (nonVIPIndex === -1) {
              updatedPendingOrders.push(newOrder);
            } else {
              updatedPendingOrders.splice(nonVIPIndex, 0, newOrder);
            }
          } else {
            updatedPendingOrders.push(newOrder);
          }

          return {
            pendingOrders: updatedPendingOrders,
            orderNumber: state.orderNumber + 1,
          };
        }),

      // Remove an order
      removeOrder: (id) =>
        set((state) => ({
          pendingOrders: state.pendingOrders.filter((order) => order.id !== id),
        })),

      // Complete an order
      completeOrder: (id) =>
        set((state) => {
          const order = state.pendingOrders.find((o) => o.id === id);
          if (!order) return state;

          order.status = "COMPLETED";
          order.updatedAt = new Date().toISOString();

          return {
            pendingOrders: state.pendingOrders.filter((o) => o.id !== id),
            completedOrders: [...state.completedOrders, order],
          };
        }),

      numbersOfBots: 0,
      bots: [],

      // Add a new bot
      addBot: () => {
        const newBot: Bot = {
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "IDLE",
          orderId: null,
          timeOutId: null,
          orderNumber: null,
        };

        set((state) => ({
          bots: [...state.bots, newBot],
          numbersOfBots: state.numbersOfBots + 1,
        }));

        // Trigger order processing for the new bot
        get().processOrder(newBot.id);
      },

      // Remove the newest bot
      removeBot: () =>
        set((state) => {
          const botToRemove = state.bots[state.bots.length - 1];
          if (!botToRemove) return state;

          const updatedBots = state.bots.filter((bot) => bot.id !== botToRemove.id);

          // If the bot is processing an order, return the order to pending
          const updatedPendingOrders = [...state.pendingOrders];
          if (botToRemove.orderId) {
            clearTimeout(botToRemove.timeOutId!);

            const order = updatedPendingOrders.find(
              (o) => o.id === botToRemove.orderId
            );
            if (order) {
              order.status = "PENDING";
              order.updatedAt = new Date().toISOString();
            }
          }

          return {
            bots: updatedBots,
            numbersOfBots: Math.max(state.numbersOfBots - 1, 0),
            pendingOrders: updatedPendingOrders,
          };
        }),

      // Process an order with a bot
      processOrder: (botId) => {
        const { pendingOrders, bots, completeOrder } = get();

        const bot = bots.find((b) => b.id === botId);
        if (!bot) return;

        // Find the next pending order
        const nextOrder = pendingOrders.find((o) => o.status === "PENDING");

        // If no order is available, mark the bot as idle
        if (!nextOrder) {
          set((state) => ({
            bots: state.bots.map((b) =>
              b.id === bot.id
                ? {
                    ...b,
                    status: "IDLE",
                    orderId: null,
                    timeOutId: null,
                    orderNumber: null,
                  }
                : b
            ),
          }));
          return;
        }

        // Update order and bot status
        nextOrder.status = "PROCESSING";
        nextOrder.updatedAt = new Date().toISOString();

        const timeOutId = setTimeout(() => {
          // Mark bot as idle after processing
          set((state) => ({
            bots: state.bots.map((b) =>
              b.id === bot.id
                ? {
                    ...b,
                    status: "IDLE",
                    orderId: null,
                    timeOutId: null,
                    orderNumber: null,
                  }
                : b
            ),
          }));

          completeOrder(nextOrder.id);

          // Process the next order if available
          get().processOrder(bot.id);
        }, nextOrder.orderProcessingTime * 1000);

        set((state) => ({
          bots: state.bots.map((b) =>
            b.id === bot.id
              ? {
                  ...b,
                  status: "PROCESSING",
                  orderId: nextOrder.id,
                  timeOutId: timeOutId,
                  orderNumber: nextOrder.orderNumber,
                }
              : b
          ),
          pendingOrders: [...state.pendingOrders],
        }));
      },
    }),
    {
      name: "order-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
