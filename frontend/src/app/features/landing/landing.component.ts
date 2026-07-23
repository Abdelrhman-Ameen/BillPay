import { afterNextRender, Component, ElementRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowDown,
  LucideArrowRight,
  LucideBolt,
  LucideCheck,
  LucideCreditCard,
  LucideLandmark,
  LucideReceiptText,
  LucideShieldCheck,
  LucideSmartphone,
  LucideWallet,
  LucideWifi,
  LucideZap,
} from '@lucide/angular';

@Component({
  selector: 'app-landing',
  imports: [
    RouterLink,
    LucideArrowDown,
    LucideArrowRight,
    LucideBolt,
    LucideCheck,
    LucideCreditCard,
    LucideLandmark,
    LucideReceiptText,
    LucideShieldCheck,
    LucideSmartphone,
    LucideWallet,
    LucideWifi,
    LucideZap,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  constructor() {
    afterNextRender(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              observer.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.16 },
      );
      this.host.nativeElement
        .querySelectorAll<HTMLElement>('[data-reveal]')
        .forEach((item: HTMLElement) => observer.observe(item));
    });
  }
}
