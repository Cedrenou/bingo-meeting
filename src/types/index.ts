export type MeetingStatus = 'draft' | 'in_progress' | 'completed';

export interface Meeting {
  id: string;
  title: string;
  description: string | null;
  grid_cols: number;
  status: MeetingStatus;
  share_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  meeting_id: string;
  title: string;
  emoji: string;
  color: string;
  position: number;
  is_done: boolean;
  done_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  photos?: Photo[];
}

export interface Photo {
  id: string;
  theme_id: string;
  storage_path: string;
  filename: string;
  caption: string | null;
  position: number;
  uploaded_by: string | null;
  created_at: string;
  url?: string;
}

export interface NewMeeting {
  title: string;
  description?: string | null;
  grid_cols: number;
}

export interface NewTheme {
  meeting_id: string;
  title: string;
  emoji: string;
  color: string;
  position: number;
}

export interface NewPhoto {
  theme_id: string;
  storage_path: string;
  filename: string;
  caption?: string | null;
  position: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
