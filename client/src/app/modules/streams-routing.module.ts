import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StreamsComponent } from '../components/streams/streams.component';
// import { AuthGuard } from '../services/auth.guard';
import { CommentsComponent } from '../components/comments/comments.component';
import { PeopleComponent } from '../components/people/people.component';
import { FollowingComponent } from '../components/following/following.component';
import { FollowersComponent } from '../components/followers/followers.component';
import { NotificationsComponent } from '../components/notifications/notifications.component';
import { ChatComponent } from '../components/chat/chat.component';
import { ImagesComponent } from '../components/images/images.component';
import { ViewUserComponent } from '../components/view-user/view-user.component';
import { ChangePasswordComponent } from '../components/change-password/change-password.component';
import { ToolbarComponent } from '../components/toolbar/toolbar.component';

// canActivate: [AuthGuard]
const routes: Routes = [
 { path: '', component: ToolbarComponent, children:
    [
      {
        path: 'streams',
        component: StreamsComponent,
      },
      {
        path: 'post/:id',
        component: CommentsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'people',
        component: PeopleComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'people/following',
        component: FollowingComponent,
      },
      {
        path: 'people/followers',
        component: FollowersComponent,
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
      },
      {
        path: 'chat/:name',
        component: ChatComponent,
      },
      {
        path: 'images/:name',
        component: ImagesComponent,
      },
      {
        path: ':name',
        component: ViewUserComponent,
      },
      {
        path: 'account/password',
        component: ChangePasswordComponent,
      },
      {
        path: '**',
        redirectTo: 'streams'
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class StreamsRoutingModule { }
