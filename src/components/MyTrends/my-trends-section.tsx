import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  title: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
};

const MyTrendsSection: React.FC<Props> = ({ title, children, headerRight }) => (
  <Card className="text-md flex w-full flex-col rounded-sm border-transparent bg-accent2 p-1 pb-4 text-text shadow-md md:pb-6 md:text-base lg:text-xl">
    <CardHeader className="mb-4 w-full rounded-md bg-accent5 p-2 shadow-md md:mb-8">
      <div className="flex w-full items-center justify-between gap-4">
        <CardTitle className="text-base shadow-sm md:text-lg lg:text-2xl">
          {title}
        </CardTitle>
        {headerRight}
      </div>
    </CardHeader>
    <CardContent className="flex flex-col gap-6 px-2 md:px-4">{children}</CardContent>
  </Card>
);

export default MyTrendsSection;
