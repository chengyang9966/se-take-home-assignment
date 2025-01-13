import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Order } from "../interface/order";
import { v4 as uuidv4 } from "uuid";
import { Bot } from "../interface/bot";
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
      addOrder: (order) =>
        set((state) => {
          const pendingOrders = state.pendingOrders;
          const updatedOrder = {
            ...order,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            orderNumber: state.orderNumber + 1,
            orderProcessingTime: 10,
          };
          if (order.type === "VIP") {
            const vipIndex = state.pendingOrders.findIndex(
              (order) => order.type !== "VIP"
            );
            // if there is no non-vip order, just push the order to the end
            if (vipIndex === -1) {
              pendingOrders.push(updatedOrder);
            } else {
              // insert the vip order before the first non-vip order
              pendingOrders.splice(vipIndex, 0, updatedOrder);
            }
          } else {
            pendingOrders.push(updatedOrder);
          }

          return {
            pendingOrders: pendingOrders,
            orderNumber: state.orderNumber + 1,
          };
        }),
      removeOrder: (id) =>
        set((state) => ({
          pendingOrders: state.pendingOrders.filter((order) => order.id !== id),
        })),
      completeOrder: (id) =>
        set((state) => {
          const order = state.pendingOrders.find((order) => order.id === id);
          if (order) {
            order.status = "COMPLETED";
            order.updatedAt = new Date().toISOString();
            state.completedOrders.push(order);
          }
          return {
            pendingOrders: state.pendingOrders.filter(
              (order) => order.id !== id
            ),
            completedOrders: state.completedOrders,
          };
        }),
      numbersOfBots: 0,
      bots: [],
      addBot: () => {
        const newBot: Bot = {
          status: "IDLE",
          orderId: null,
          timeOutId: null,
          orderNumber: null,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => {
          const updatedBots = [...state.bots, newBot];
          const numbersOfBots = state.numbersOfBots + 1;
          return {
            bots: updatedBots,
            numbersOfBots: numbersOfBots,
          };
        });
        get().processOrder(newBot.id);
      },
      removeBot: () =>
        set((state) => {
          const botToRemove = state.bots[state.bots.length - 1];
          if (!botToRemove) return state;
          const bots = state.bots.filter((bot) => bot.id !== botToRemove.id);

          const pendingOrders = [...state.pendingOrders];
          if (botToRemove.orderId) {
            if (botToRemove.timeOutId) {
              clearTimeout(botToRemove.timeOutId);
            }

            const orderIndex = state.pendingOrders.findIndex(
              (order) => order.id === botToRemove.orderId
            );

            if (orderIndex !== -1) {
              pendingOrders[orderIndex].status = "PENDING";
              pendingOrders[orderIndex].updatedAt = new Date().toISOString();
            }
          }

          const numbersOfBots =
            state.numbersOfBots - 1 > 0 ? state.numbersOfBots - 1 : 0;

          return {
            bots,
            pendingOrders,
            numbersOfBots,
          };
        }),
      processOrder: (botId) => {

        const { pendingOrders, bots, completeOrder } = get();
        const bot = bots.find((bot) => bot.id === botId);
        const pendingOrdersWithStatusPending = pendingOrders.filter(
          (x) => x.status === "PENDING"
        );
        if (!bot || pendingOrdersWithStatusPending.length === 0) return;
        const order = pendingOrdersWithStatusPending[0];
        order.status = "PROCESSING";
        order.updatedAt = new Date().toISOString();
        const timeOutId = setTimeout(() => {
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

          completeOrder(order.id);

          // Process the next order
          get().processOrder(bot.id);
        }, order.orderProcessingTime * 1000);
        set((state) => ({
          bots: state.bots.map((b) =>
            b.id === bot.id
              ? {
                  ...b,
                  status: "PROCESSING",
                  orderId: order.id,
                  timeOutId: timeOutId,
                  orderNumber: order.orderNumber,
                  updatedAt: new Date().toISOString(),
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
