import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText } from 'lucide-react';
import type { Product } from '../backend';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const priceDisplay = `$${(Number(product.priceInCents) / 100).toFixed(2)}`;

  return (
    <Card className="card-hover h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            {product.title.toLowerCase().includes('book') ? (
              <BookOpen className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span className="text-xs uppercase tracking-wide">
              {product.title.toLowerCase().includes('book') ? 'Book' : 'Notes'}
            </span>
          </div>
          {product.isPublished && (
            <Badge variant="secondary" className="text-xs">
              Available
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl line-clamp-2">{product.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">by {product.author}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4 border-t">
        <div className="text-2xl font-bold">{priceDisplay}</div>
        <Link to="/product/$productId" params={{ productId: product.id }}>
          <Button size="sm">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
