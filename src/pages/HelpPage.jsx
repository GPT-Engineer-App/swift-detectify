import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const HelpPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Help & FAQ</h1>
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>How does the object detection work?</AccordionTrigger>
              <AccordionContent>
                Our app uses advanced computer vision algorithms to detect and classify different types of recyclable containers in real-time. It analyzes the video feed and identifies objects based on their shape, size, and other visual characteristics.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I customize the detection settings?</AccordionTrigger>
              <AccordionContent>
                Yes, you can adjust the detection threshold and update interval in the Settings page. These changes can help fine-tune the app's performance based on your specific environment and needs.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How accurate is the object counting?</AccordionTrigger>
              <AccordionContent>
                The accuracy of object counting depends on various factors such as lighting conditions, camera quality, and object positioning. Under optimal conditions, our system achieves high accuracy rates. You can improve accuracy by ensuring good lighting and clear visibility of objects.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpPage;
