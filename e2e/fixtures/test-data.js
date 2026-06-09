export const TEST_USER = {
  id: 'test-user-uuid-0001',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'testuser@kirobit.dev',
  email_confirmed_at: '2025-01-01T00:00:00.000Z',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  user_metadata: {
    full_name: 'Test User',
    name: 'Test User',
    avatar_url: '',
    email: 'testuser@kirobit.dev',
  },
  app_metadata: { provider: 'google', providers: ['google'] },
}

export const TEST_FOLDERS = [
  {
    id: 'folder-001',
    user_id: TEST_USER.id,
    name: 'Work Notes',
    created_at: '2025-06-01T10:00:00.000Z',
  },
  {
    id: 'folder-002',
    user_id: TEST_USER.id,
    name: 'Personal',
    created_at: '2025-06-02T10:00:00.000Z',
  },
]

export const TEST_NOTES = [
  {
    id: 'note-001',
    user_id: TEST_USER.id,
    title: 'Meeting Agenda',
    content: '<p>Discuss quarterly goals and project timelines</p>',
    folder_id: 'folder-001',
    is_favorite: true,
    created_at: '2025-06-10T09:00:00.000Z',
    updated_at: '2025-06-15T14:30:00.000Z',
  },
  {
    id: 'note-002',
    user_id: TEST_USER.id,
    title: 'API Design Draft',
    content: '<p>REST endpoints for the new user service</p>',
    folder_id: 'folder-001',
    is_favorite: false,
    created_at: '2025-06-11T11:00:00.000Z',
    updated_at: '2025-06-14T08:00:00.000Z',
  },
  {
    id: 'note-003',
    user_id: TEST_USER.id,
    title: 'Shopping List',
    content: '<p>Milk, eggs, bread, coffee beans</p>',
    folder_id: 'folder-002',
    is_favorite: false,
    created_at: '2025-06-12T07:00:00.000Z',
    updated_at: '2025-06-13T18:00:00.000Z',
  },
  {
    id: 'note-004',
    user_id: TEST_USER.id,
    title: 'Quick Thought',
    content: '<p>Remember to refactor the auth module</p>',
    folder_id: null,
    is_favorite: true,
    created_at: '2025-06-13T20:00:00.000Z',
    updated_at: '2025-06-16T10:00:00.000Z',
  },
  {
    id: 'note-005',
    user_id: TEST_USER.id,
    title: 'Standalone Note',
    content: '<p>This note has no folder</p>',
    folder_id: null,
    is_favorite: false,
    created_at: '2025-06-14T12:00:00.000Z',
    updated_at: '2025-06-14T12:00:00.000Z',
  },
]
