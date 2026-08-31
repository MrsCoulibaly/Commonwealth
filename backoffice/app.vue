<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const siteName = String(config.public.siteName || 'Commonwealth')
const siteUrl = String(config.public.siteUrl || 'https://www.commonwealth-school.com').replace(/\/$/, '')

useHead({
  titleTemplate: (title) => {
    const chunk = String(title ?? '').trim()
    if (!chunk || chunk === siteName) return siteName
    return `${chunk} · ${siteName}`
  },
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Preschool',
            '@id': `${siteUrl}/#school`,
            name: siteName,
            legalName: 'Commonwealth Preschool of Abidjan',
            url: siteUrl,
            logo: `${siteUrl}/logo.png`,
            image: `${siteUrl}/logo.png`,
            telephone: String(config.public.schoolPhone || ''),
            email: String(config.public.schoolDirectionEmail || ''),
            address: {
              '@type': 'PostalAddress',
              streetAddress: String(config.public.schoolAddress || ''),
              addressLocality: 'Abidjan',
              addressCountry: 'CI',
            },
          },
          {
            '@type': 'WebSite',
            '@id': `${siteUrl}/#website`,
            name: siteName,
            url: siteUrl,
            publisher: { '@id': `${siteUrl}/#school` },
            inLanguage: ['fr', 'en'],
          },
        ],
      }),
    },
  ],
})
</script>
