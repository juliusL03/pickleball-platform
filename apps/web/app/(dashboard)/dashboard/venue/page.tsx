import { Button, Card, CardContent, CardHeader, CardTitle, Container } from '@juls/pickleball-kit/ui';

export default function VenueManagementPage() {
  return (
    <Container>
      <section className="py-8">
        <h1 className="text-3xl font-bold mb-6">Venue Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Venue Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Update venue details, hours, and contact info</p>
            <Button>Edit Venue</Button>
          </CardContent>
        </Card>
      </section>
    </Container>
  );
}
