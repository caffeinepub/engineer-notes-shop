import { Mail, MessageSquare, HelpCircle, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ContactPage() {
  return (
    <div className="page-container section-spacing">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            We're here to help. Get in touch with our team.
          </p>
        </div>

        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            For the best support experience, please sign in to your account before reaching out. 
            This helps us provide you with personalized assistance.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                General Inquiries
              </CardTitle>
              <CardDescription>
                Questions about our platform or services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                For general questions about Engineer Notes, our collection, or how to use the platform, 
                please reach out to our support team.
              </p>
              <p className="font-medium">support@engineernotes.example.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Technical Support
              </CardTitle>
              <CardDescription>
                Help with purchases or account issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Experiencing technical difficulties or need help with your account? 
                Our technical support team is ready to assist you.
              </p>
              <p className="font-medium">tech@engineernotes.example.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Content Suggestions
              </CardTitle>
              <CardDescription>
                Recommend resources for our collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Have a suggestion for engineering resources you'd like to see in our collection? 
                We'd love to hear from you.
              </p>
              <p className="font-medium">content@engineernotes.example.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Business Inquiries
              </CardTitle>
              <CardDescription>
                Partnerships and collaborations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Interested in partnering with Engineer Notes or have a business proposal? 
                Let's discuss how we can work together.
              </p>
              <p className="font-medium">business@engineernotes.example.com</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted rounded-lg p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            <div>
              <h3 className="font-semibold mb-2">How do I access my purchased resources?</h3>
              <p className="text-muted-foreground">
                After signing in, navigate to "My Library" to view and download all your purchased materials.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept various payment methods through our secure blockchain-based payment system.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I get a refund?</h3>
              <p className="text-muted-foreground">
                Due to the digital nature of our products, all sales are final. However, if you experience 
                technical issues accessing your purchase, please contact our support team.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How often is new content added?</h3>
              <p className="text-muted-foreground">
                We regularly update our collection with new engineering resources. Check back frequently 
                or sign up for our newsletter to stay informed about new additions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
