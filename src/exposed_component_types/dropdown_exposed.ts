export interface DropdownExposed extends Vue {
  show(): void
  hide(): void
  state: { is_open: boolean }
}
