import { Routes } from '@angular/router';
import { SimpleComponent } from './routes/simple/simple.component';
import { DbManagementComponent } from './routes/db-management/db-management.component';
import { PrismaComponent } from './routes/prisma/prisma.component';
import { TestingComponent } from './routes/testing/testing.component';

export const routes: Routes = [
  {
    path: 'simple',
    component: SimpleComponent,
  },
  {
    path: 'db-management',
    component: DbManagementComponent,
  },
  {
    path: 'prisma',
    component: PrismaComponent,
  },
  {
    path: 'testing',
    component: TestingComponent,
  },
  {
    path: '',
    redirectTo: 'simple',
    pathMatch: 'full',
  },
];
