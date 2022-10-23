export type FileWriterConfig = {
  id: number,                   // Unique, static id of filewriter
  frame_rate_scale: number;     // Amount to scale frame rate down by
  name_format: string;          // Name format in the form a string where "NAME", "{DATE}", "{TIME}" denote where to insert camera name, date, and time respectively
  delete_after: number;         // Time after creation to delete a file in ms
  save_dir: string;             // Path to directory to save to
  vid_length: number,           // Length of a video in ms
  on_motion: boolean            // Create file on motion or continuously
}

export type VidIndex = {
  videos: Array<{
    file_loc: string;
    date: number;
    expires: number;
  }>
}