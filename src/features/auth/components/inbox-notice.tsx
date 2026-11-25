import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";

export function InboxNotice({
  children,
  onBack,
}: {
  children: string;
  onBack: () => void;
}) {
  return (
    <div className="grid gap-3">
      <Alert role="status">
        <AlertTitle>Check your inbox</AlertTitle>
        <AlertDescription>
          {children} Use the same browser you’re using now.
        </AlertDescription>
      </Alert>
      <Button variant="link" onPress={onBack}>
        Back
      </Button>
    </div>
  );
}
