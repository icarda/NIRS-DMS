import {
  Bean,
  ChartColumn,
  Dna,
  FilterIcon,
  TestTubeDiagonal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterForm } from "./components/filter-form";

export default function Dashboard() {
  return (
    <div>
      <div className="border-b">
        <div className="flex items-center justify-between">
          <Tabs defaultValue="overview">
            <TabsList className="h-12 bg-transparent">
              <TabsTrigger
                value="overview"
                className="relative h-12 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                Overview
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost">
                <FilterIcon className="h-4 w-4" />
                Filter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Data</DialogTitle>
                <DialogDescription>
                  Get insights based on metadata
                </DialogDescription>
              </DialogHeader>
              <FilterForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Samples</CardTitle>
            <TestTubeDiagonal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3264</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
            <ChartColumn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">652</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Species Analyzed
            </CardTitle>
            <Bean className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Traits Measured
            </CardTitle>
            <Dna className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Graph 1</CardTitle>
          </CardHeader>
          <CardContent>Graph 1</CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Graph 2</CardTitle>
          </CardHeader>
          <CardContent>Graph 2</CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Graph 3</CardTitle>
          </CardHeader>
          <CardContent>Graph 3</CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Graph 4</CardTitle>
          </CardHeader>
          <CardContent>Graph 4</CardContent>
        </Card>
      </div>
    </div>
  );
}
