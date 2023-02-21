import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { map, Observable, take } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) {}

    //as Max points out, this should be a ONE-TIME view of this.auth.user.
    //an ongoing subscription could be weird if user emits multiple things.
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.auth.user.pipe(
            take(1),
            map( user => { 
                const isAuth = !!user;
                if (isAuth) { return true; }
                else { return this.router.createUrlTree(['/auth']); }
            } )
        )
    }
}