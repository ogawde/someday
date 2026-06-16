interface PendoVisitor {
  id: string;
  email?: string;
  username?: string;
}

interface Window {
  pendo?: {
    initialize: (config: { visitor: { id: string } }) => void;
    identify: (config: { visitor: PendoVisitor }) => void;
    pageLoad?: () => void;
    track?: (event: string, metadata?: Record<string, unknown>) => void;
  };
}
