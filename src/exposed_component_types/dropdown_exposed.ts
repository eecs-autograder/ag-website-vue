export interface DropdownExposed extends Vue {
  is_open(): boolean
  show(): void
  hide(): void
  state: unknown
}
