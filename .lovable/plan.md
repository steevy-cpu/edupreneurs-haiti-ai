
# Replace "Nouveau: Blog" Badge with "Fait un don avec nous" in HeroSection

## Change

In `src/components/home/HeroSection.tsx`, replace the Blog badge link with a donation badge that redirects to `/donate`.

### Details

- **Remove**: The `<Link to="/blog">` badge with Rss icon and "Nouveau: Blog" text
- **Add**: A `<Link to="/donate">` badge with a Heart icon and "Fait un don avec nous" text
- **Import**: Replace `Rss` icon import with `Heart` from lucide-react
- **Styling**: Keep the same accent-colored badge styling so it visually matches the existing design

### File: `src/components/home/HeroSection.tsx`

| What | Before | After |
|------|--------|-------|
| Icon import | `Rss` | `Heart` |
| Link target | `/blog` | `/donate` |
| Badge text | "Nouveau: Blog" | "Fait un don avec nous" |

## Safety Checklist

| Check | Result |
|-------|--------|
| Breaks existing functionality? | No -- blog page still accessible via nav/footer |
| 3G optimized? | Yes -- no new assets |
| Backward compatible? | Yes |
