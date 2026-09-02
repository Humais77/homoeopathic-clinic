import "dotenv/config";

export const SITE_ASSETS = {
  logo: process.env.NEXT_PUBLIC_CLOUDINARY_LOGO!,
  hero: process.env.NEXT_PUBLIC_CLOUDINARY_HERO!,
  founder: process.env.NEXT_PUBLIC_CLOUDINARY_FOUNDER!,
  aboutDoctor1: process.env.NEXT_PUBLIC_CLOUDINARY_ABOUT_DOCTOR_1!,
  aboutDoctor2: process.env.NEXT_PUBLIC_CLOUDINARY_ABOUT_DOCTOR_2!,
  startJourney: process.env.NEXT_PUBLIC_CLOUDINARY_START_JOURNEY!,
  whyHealByNature:
    process.env.NEXT_PUBLIC_CLOUDINARY_WHY_HEAL_BY_NATURE!,
   whyHealByNature_shield: process.env.NEXT_PUBLIC_CLOUDINARY_SHIELD!,
   footerLogo: process.env.NEXT_PUBLIC_CLOUDINARY_FOOTER_LOGO!,
};