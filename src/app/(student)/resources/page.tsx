import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RESOURCE_CATEGORIES } from "@/types";
import { ExternalLink, Phone, Video, FileText } from "lucide-react";
import Link from "next/link";

const typeIcons = {
  article: FileText,
  video: Video,
  helpline: Phone,
  institution: FileText,
};

export default async function ResourcesPage() {
  const profile = await requireProfile(["student"]);
  const supabase = await createClient();

  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .or(`institution_id.eq.${profile.institution_id},is_global.eq.true`)
    .order("category");

  const grouped = RESOURCE_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = (resources ?? []).filter((r) => r.category === cat);
      return acc;
    },
    {} as Record<string, typeof resources>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Resource Library</h1>
        <p className="text-sm text-muted-foreground">
          Support resources for your wellbeing journey
        </p>
      </div>

      <Tabs defaultValue={RESOURCE_CATEGORIES[0]}>
        <TabsList className="flex h-auto flex-wrap gap-1">
          {RESOURCE_CATEGORIES.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat.replace("_", " ")}
            </TabsTrigger>
          ))}
        </TabsList>

        {RESOURCE_CATEGORIES.map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {(grouped[cat] ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No resources in this category yet.</p>
              ) : (
                grouped[cat]?.map((resource) => {
                  const Icon = typeIcons[resource.type as keyof typeof typeIcons] ?? FileText;
                  return (
                    <Card key={resource.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <Icon className="h-5 w-5 text-primary" />
                          <Badge variant="outline" className="capitalize">
                            {resource.type}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        {resource.description && (
                          <CardDescription>{resource.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        {resource.url ? (
                          <Link
                            href={resource.url}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            Open resource <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : resource.content ? (
                          <p className="text-sm text-muted-foreground">{resource.content}</p>
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
