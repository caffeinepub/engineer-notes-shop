import { BookOpen, Users, Target, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="page-container section-spacing">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">About Engineer Notes</h1>
          <p className="text-xl text-muted-foreground">
            Your trusted source for high-quality engineering resources and technical documentation
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p>
            Engineer Notes is a specialized platform dedicated to providing engineers, students, and technical professionals 
            with access to comprehensive engineering books, technical notes, and educational resources. Our mission is to make 
            quality engineering knowledge accessible to everyone who seeks to advance their technical expertise.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To democratize access to high-quality engineering education by curating and distributing 
                the best technical resources from leading experts and institutions around the world.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Our Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We offer a carefully selected collection of engineering books, technical notes, and study materials 
                covering various disciplines including mechanical, electrical, civil, and software engineering.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Our Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Join thousands of engineers and students who trust Engineer Notes for their learning and 
                professional development needs. We're building a community of lifelong learners.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Quality Assurance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Every resource in our collection is carefully reviewed and verified for accuracy, relevance, 
                and educational value to ensure you receive only the best materials.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted rounded-lg p-8 text-center space-y-4">
          <h2 className="text-2xl font-semibold">Why Choose Engineer Notes?</h2>
          <ul className="text-left max-w-2xl mx-auto space-y-2 text-muted-foreground">
            <li>✓ Curated collection of high-quality engineering resources</li>
            <li>✓ Instant digital access to all purchased materials</li>
            <li>✓ Secure and reliable platform built on blockchain technology</li>
            <li>✓ Regular updates with new content and resources</li>
            <li>✓ Dedicated support for all our users</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
