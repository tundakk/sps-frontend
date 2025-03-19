import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/app/_components/ui/card";
import { Separator } from "@/src/app/_components/ui/separator";

export default async function Home() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Welcome to SPS Web</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col p-6 gap-4">
        <p>This is the homepage of the application. You are now logged in.</p>
      </CardContent>
    </Card>
  );
}
