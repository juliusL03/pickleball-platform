import { Button, Card, CardContent, CardHeader, CardTitle, Container } from '@juls/pickleball-kit/ui';

export default function CourtsManagementPage() {
  return (
    <Container>
      <section className="py-8">
        <h1 className="text-3xl font-bold mb-6">Court Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Courts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Add, edit, and manage courts</p>
            <Button>Add Court</Button>
          </CardContent>
        </Card>
      </section>
    </Container>
  );
}
