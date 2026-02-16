import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';

describe('Concerts API Integration (ValidationPipe)', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      })
    );

    await app.listen(0, '127.0.0.1');
    baseUrl = await app.getUrl();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects create concert when name/description are whitespace only', async () => {
    const response = await fetch(`${baseUrl}/concerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: '   ',
        description: '   ',
        totalSeats: 100
      })
    });

    expect(response.status).toBe(400);
    const body = (await response.json()) as { message: string[] };
    expect(body.message).toEqual(
      expect.arrayContaining([
        'name should not be empty',
        'description should not be empty'
      ])
    );
  });

  it('rejects reserve seat when userId is whitespace only', async () => {
    const createResponse = await fetch(`${baseUrl}/concerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'NIKI Live',
        description: 'One night only',
        totalSeats: 10
      })
    });
    const concert = (await createResponse.json()) as { id: string };

    const response = await fetch(`${baseUrl}/concerts/${concert.id}/reserve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: '   ' })
    });

    expect(response.status).toBe(400);
    const body = (await response.json()) as { message: string[] };
    expect(body.message).toEqual(expect.arrayContaining(['userId should not be empty']));
  });

  it('rejects user history query when userId is whitespace only', async () => {
    const response = await fetch(`${baseUrl}/concerts/history?userId=%20%20%20`);
    expect(response.status).toBe(400);

    const body = (await response.json()) as { message: string };
    expect(body.message).toBe('userId is required');
  });
});
