import { Button, Card, CardContent, CardHeader, CardTitle, Container } from '@juls/pickleball-kit/ui';

export default function ContentManagementPage() {
  return (
    <Container>
      <section className="py-8">
        <h1 className="text-3xl font-bold mb-6">Content Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Homepage Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Manage homepage announcements and promotions</p>
            <Button>Edit Content</Button>
          </CardContent>
        </Card>
      </section>
    </Container>
  );
}
