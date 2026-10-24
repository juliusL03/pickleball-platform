import { Button, Card, CardContent, CardHeader, CardTitle, Container, Stack } from '@juls/pickleball-kit/ui';

export default function HomePage() {
  return (
    <Container>
      <section className="py-12">
        <Stack gap={6}>
          <div>
            <h1 className="text-4xl font-bold text-primary-700">Book Your Court</h1>
            <p className="text-lg text-gray-600 mt-2">Premium pickleball courts for everyone</p>
          </div>
          <Button>View Courts</Button>
        </Stack>
      </section>
      <section className="py-8">
        <h2 className="text-2xl font-semibold mb-4">Announcements</h2>
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Book online now to reserve your court time.</p>
          </CardContent>
        </Card>
      </section>
    </Container>
  );
}
