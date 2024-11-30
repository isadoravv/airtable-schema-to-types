export interface Attachment {
    id: string;
    url: string;
    filename: string;
    size: number;
    type: string;  // e.g., 'image/jpeg', 'application/pdf'
    width?: number;  // Optional, if the attachment is an image
    height?: number; // Optional, if the attachment is an image
    thumbnails?: { [key: string]: { url: string, width: number, height: number } }; // Optional, image thumbnails
  }
  