import {
  getDistricts,
  getProvince,
  getRegency,
  getVillages,
} from '@/app/actions/areaDataAction'
import { getCartItems } from '@/app/actions/cartAction'
import { validateSession } from '@/app/actions/session'
import { create } from 'zustand'

type ModalLoginStore = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}
type RefreshStore = {
  refreshFlag: boolean
  triggerRefresh: () => void
}

interface AuthStore {
  user: any
  isOpenModal: boolean
  login: (userData: any) => void
  logout: () => void
  openModal: () => void
  closeModal: () => void
}

export const useModalLogin = create<ModalLoginStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isOpenModal: false,
  login: (userData) => set({ user: userData, isOpenModal: false }),
  logout: () => set({ user: null }),
  openModal: () => set({ isOpenModal: true }),
  closeModal: () => set({ isOpenModal: false }),
}))

export const useRefresh = create<RefreshStore>((set) => ({
  refreshFlag: false,
  triggerRefresh: () => set({ refreshFlag: true }),
  // toggle untuk memicu efek
}))

type Prov = { code: string; name: string }
type City = { code: string; name: string }
type District = { code: string; name: string }
type Village = { code: string; name: string; postal_code?: string }
interface AreaDataStore {
  prov: Prov[]
  city: City[]
  district: District[]
  village: Village[]
  postalCode: string | null
  loading: boolean
  error: string | null
  fetchProvince: () => Promise<void>
  fetchCity: (provinceId: string) => Promise<void>
  fetchDistrict: (cityId: string) => Promise<void>
  fetchVillage: (districtId: string) => Promise<void>
}
export const useAreaData = create<AreaDataStore>((set) => ({
  prov: [],
  city: [],
  district: [],
  village: [],
  postalCode: null,
  loading: false,
  error: null,
  fetchProvince: async () => {
    set({ loading: true, error: null })
    try {
      const res = await getProvince()
      const data = res?.data
      if (data) {
        set(() => ({ prov: data, loading: false }))
      }
    } catch (error) {
      set({ error: 'Gagal memuat data provinsi', loading: false })
    }
  },
  fetchCity: async (provinceId: string) => {
    set({ loading: true, error: null })
    try {
      const res = await getRegency(provinceId)
      const data = res?.data
      if (data) {
        set(() => ({ city: data, loading: false }))
      }
    } catch (error) {
      set({ error: 'Gagal memuat data kota', loading: false })
    }
  },
  fetchDistrict: async (cityId: string) => {
    set({ loading: true, error: null })
    try {
      const res = await getDistricts(cityId)
      const data = res?.data
      if (data) {
        set(() => ({ district: data, loading: false }))
      }
    } catch (error) {
      set({ error: 'Gagal memuat data kecamatan', loading: false })
    }
  },
  fetchVillage: async (districtId: string) => {
    set({ loading: true, error: null })
    try {
      const res = await getVillages(districtId)
      const data = res?.data
      if (data) {
        set(() => ({ village: data, loading: false }))
      }
    } catch (error) {
      set({ error: 'Gagal memuat data kode pos', loading: false })
    }
  },
}))

interface CartItem {
  id: string
  product: {
    id: string
    name: string
    images: string[]
    price: number
    unit: string
  }
  quantity: number
}

interface CartStore {
  items: CartItem[]
  loading: boolean
  error: string | null
  selectedItems: string[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  selectItem: (id: string) => void
  selectAll: () => void
  clearCart: () => void
  fetchCart: () => Promise<void>
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  selectedItems: [],

  addToCart: (item) => {
    set((state) => ({
      items: [...state.items, item],
    }))
  },

  removeFromCart: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      selectedItems: state.selectedItems.filter((itemId) => itemId !== id),
    }))
  },

  updateQuantity: (id, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }))
  },

  selectItem: (id) => {
    set((state) => ({
      selectedItems: state.selectedItems.includes(id)
        ? state.selectedItems.filter((itemId) => itemId !== id)
        : [...state.selectedItems, id],
    }))
  },

  selectAll: () => {
    set((state) => ({
      selectedItems:
        state.selectedItems.length === state.items.length
          ? []
          : state.items.map((item) => item.id),
    }))
  },

  clearCart: () => {
    set({ items: [], selectedItems: [] })
  },

  fetchCart: async () => {
    set({ loading: true, error: null })

    try {
      const result = await getCartItems() // TODO: Replace with actual user ID
      if (result.success) {
        set({
          items: result.data,
          loading: false,
        })
      }
      console.log('result 232', result)
    } catch (error) {
      set({ error: 'Gagal memuat keranjang', loading: false })
    }
  },
}))
