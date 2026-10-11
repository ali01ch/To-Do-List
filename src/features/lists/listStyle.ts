import { Book, Briefcase, Folder, Heart, Inbox, Star } from '@lucide/vue'
import type { Component } from 'vue'
import type { ListColor, ListIcon } from '@/domain/types'

export const listColorClass: Record<ListColor, string> = {
  teal: 'bg-[#0e5f58]',
  clay: 'bg-[#a15c38]',
  olive: 'bg-[#5f6b3a]',
  ink: 'bg-[#3d4a5c]',
  amber: 'bg-[#a37b2c]',
  iris: 'bg-[#5c4d8a]',
}

export const listIconComponent: Record<ListIcon, Component> = {
  folder: Folder,
  inbox: Inbox,
  star: Star,
  briefcase: Briefcase,
  heart: Heart,
  book: Book,
}
