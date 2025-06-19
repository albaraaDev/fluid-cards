// User related types
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Collection types
export interface Collection {
  id: string
  user_id: string
  name: string
  description?: string
  color: CollectionColor
  icon: string
  created_at: string
  updated_at: string
  cards_count?: number
}

// Card types
export interface Card {
  id: string
  collection_id: string
  front_text: string
  back_text: string
  notes?: string
  color: CardColor
  is_bookmarked: boolean
  created_at: string
  updated_at: string
}

// Color options for collections and cards
export type CollectionColor = 
  | 'blue' | 'purple' | 'green' | 'orange' 
  | 'red' | 'pink' | 'indigo' | 'teal' 
  | 'cyan' | 'emerald' | 'violet' | 'amber'

export type CardColor = CollectionColor

// Form types
export interface CreateCollectionForm {
  name: string
  description?: string
  color: CollectionColor
  icon: string
}

export interface CreateCardForm {
  front_text: string
  back_text: string
  notes?: string
  color: CardColor
}

// Study modes
export type StudyMode = 'normal' | 'shuffle' | 'bookmarked'