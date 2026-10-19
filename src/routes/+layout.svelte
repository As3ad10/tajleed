<script lang="ts">
  import './app.css';
  import type { LayoutProps } from './$types';
  let {children}:LayoutProps=$props();
</script>
<svelte:head>
  <link rel="icon" href="/brand/favicon.ico" sizes="any" />
  <link rel="icon" href="/brand/favicon-32.png" type="image/png" />
  <link rel="apple-touch-icon" href="/brand/apple-touch-icon.png" />
  <link rel="manifest" href="/brand/site.webmanifest" />
</svelte:head>
{@render children()}
