"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  video_url: z.string().url("Enter a valid video URL"),
  caption: z.string().min(1, "Caption is required").max(2200, "Caption can be max 2200 chars"),
  hashtags: z.string().optional(),
  platforms: z.array(z.enum(["instagram", "facebook", "youtube"])).min(1),
});

type UploadForm = z.infer<typeof schema>;

export default function UploadPage() {
  const form = useForm<UploadForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      video_url: "",
      caption: "",
      hashtags: "",
      platforms: ["instagram"],
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await res.json();

    if (!res.ok) {
      toast.error(payload.message ?? "Upload failed");
      return;
    }

    toast.success(payload.message ?? "Upload completed");
    form.reset({ video_url: "", caption: "", hashtags: "", platforms: ["instagram"] });
  });

  const selectedPlatforms = form.watch("platforms");
  const togglePlatform = (platform: "instagram" | "facebook" | "youtube") => {
    const next = selectedPlatforms.includes(platform)
      ? selectedPlatforms.filter((p) => p !== platform)
      : [...selectedPlatforms, platform];
    form.setValue("platforms", next, { shouldValidate: true });
  };

  return (
    <div className="page-shell">
      <h1 className="text-2xl font-semibold">Upload</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Submit New Content</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="video_url">Video URL</Label>
              <Input id="video_url" {...form.register("video_url")} />
              <p className="text-xs text-red-600">{form.formState.errors.video_url?.message}</p>
            </div>
            <div>
              <Label htmlFor="caption">Caption</Label>
              <Textarea id="caption" rows={6} {...form.register("caption")} />
              <p className="text-xs text-red-600">{form.formState.errors.caption?.message}</p>
            </div>
            <div>
              <Label htmlFor="hashtags">Hashtags (comma-separated)</Label>
              <Input id="hashtags" {...form.register("hashtags")} />
            </div>

            <div className="space-y-2">
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-4">
                {["instagram", "facebook", "youtube"].map((platform) => (
                  <label key={platform} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(platform as UploadForm["platforms"][number])}
                      onChange={() =>
                        togglePlatform(platform as UploadForm["platforms"][number])
                      }
                    />
                    <span className="capitalize">{platform}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-red-600">
                {form.formState.errors.platforms?.message as string | undefined}
              </p>
            </div>

            <Button disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Uploading..." : "Upload"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
