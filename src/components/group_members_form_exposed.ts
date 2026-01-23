import { Course } from 'ag-client-typescript';

// Interface for what's exposed by this component
export interface GroupMembersFormExposed {
  state: { usernames: string[] }
  submit: () => void
  reset: () => void
}
