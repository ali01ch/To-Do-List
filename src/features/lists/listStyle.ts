import { Book, Briefcase, Folder, Heart, Inbox, Star } from '@lucide/vue'
import type { Component } from 'vue'
import type { ListColor, ListIcon } from '@/domain/types'

/** Green-spectrum list accents for visual distinction within the brand palette. */
export const listColorClass: Record<ListColor, string> = {
  teal: 'bg-[#1a7a4c]',
  clay: 'bg-[#3f8f5b]',
  olive: 'bg-[#5a8f3a]',
  ink: 'bg-[#1e4d3a]',
  amber: 'bg-[#6b9a3d]',
  iris: 'bg-[#2d7a66]',
}

export const listIconComponent: Record<ListIcon, Component> = {
  folder: Folder,
  inbox: Inbox,
  star: Star,
  briefcase: Briefcase,
  heart: Heart,
  book: Book,
}
