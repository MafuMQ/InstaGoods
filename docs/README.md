# 📚 InstaGoods Documentation

Welcome to the InstaGoods documentation! This directory contains comprehensive guides and references for developers, contributors, and users.

---

## 📖 Documentation Files

### 1. [API Documentation](./API.md)
Complete reference for all API endpoints and Supabase database tables.

**Contents:**
- Custom API endpoints (Optimization, Geocoding)
- Supabase REST API usage
- Database table schemas
- Request/response formats
- Error handling
- Security best practices

**When to use:** When integrating with APIs or working with database operations.

---

### 2. [Component Guide](./COMPONENTS.md)
Detailed guide to the component architecture and usage.

**Contents:**
- Component directory structure
- Customer-facing components
- Supplier portal components
- UI component library (shadcn/ui)
- Context providers (Cart, Location, Wishlist)
- Custom hooks
- Best practices and patterns

**When to use:** When building new features or understanding existing components.

---

### 3. [Deployment Guide](./DEPLOYMENT.md)
Step-by-step instructions for deploying to various platforms.

**Contents:**
- Vercel deployment (recommended)
- Netlify deployment
- GitHub Pages
- AWS S3 + CloudFront
- Azure Static Web Apps
- Docker deployment
- Environment configuration
- Post-deployment checklist

**When to use:** When deploying the application to production or staging.

---

### 4. [Architecture Guide](./ARCHITECTURE.md)
In-depth explanation of system architecture and design decisions.

**Contents:**
- System overview and diagrams
- Data flow explanations
- Feature breakdowns
- Database schema
- Performance optimizations
- Security measures
- Testing strategy
- Future enhancements

**When to use:** When understanding the big picture or planning new features.

---

## 🚀 Quick Links

### Getting Started
1. Read the [main README](../README.md) for project overview
2. Follow the [Database Setup Guide](../setup_tutorial/DATABASE_SETUP.md)
3. Check the [Component Guide](./COMPONENTS.md) to understand structure
4. Review [API Documentation](./API.md) for backend integration

### Development Workflow
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build
```

### Common Tasks

**Adding a new component:**
1. Create component in appropriate directory (`customer/` or `supplier/`)
2. Follow TypeScript prop typing conventions
3. Use Tailwind CSS for styling
4. Ensure mobile responsiveness
5. Update [Component Guide](./COMPONENTS.md) if it's a major component

**Adding a new page:**
1. Create page in `src/pages/customer/` or `src/pages/supplier/`
2. Add route in `src/App.tsx`
3. Test on mobile and desktop
4. Update navigation components

**Working with the database:**
1. Check [API Documentation](./API.md) for table schemas
2. Use Supabase client from `src/integrations/supabase/`
3. Respect Row Level Security policies
4. Test queries in Supabase dashboard first

**Deploying:**
1. Follow platform-specific guide in [Deployment Guide](./DEPLOYMENT.md)
2. Set environment variables
3. Run production build locally first
4. Use checklist from deployment guide

---

## 📋 Documentation Standards

### For Contributors

When adding or updating documentation:

1. **Use clear headings** - H2 for major sections, H3 for subsections
2. **Include code examples** - Show, don't just tell
3. **Add context** - Explain the "why", not just the "how"
4. **Keep it updated** - Update docs when code changes
5. **Use markdown features** - Tables, code blocks, lists, etc.

### Markdown Format

```markdown
# Main Title

## Section

Explanation text.

### Subsection

More details.

**Example:**
```typescript
// Code example
const example = "value";
```

**When to use:** Description of when to apply this.
```

---

## 🔍 Finding Information

### By Topic

| Topic | Document | Section |
|-------|----------|---------|
| Authentication | API.md | Supabase API → Authentication |
| Cart functionality | COMPONENTS.md | Context Providers → CartContext |
| Database tables | API.md | Supabase Database Tables |
| Deployment to Vercel | DEPLOYMENT.md | Vercel Deployment |
| Location filtering | ARCHITECTURE.md | Feature Breakdown → Location-Based Filtering |
| Optimization tool | ARCHITECTURE.md | Feature Breakdown → Product Optimization |
| Product cards | COMPONENTS.md | Customer Components → ProductCard |
| Responsive design | COMPONENTS.md | Component Best Practices → Responsive Design |
| State preservation | ARCHITECTURE.md | Feature Breakdown → State Preservation |
| Supplier portal | COMPONENTS.md | Supplier Components |

---

## 🐛 Troubleshooting

### Common Issues

**Issue: Build fails**
- Check [Deployment Guide](./DEPLOYMENT.md) → Troubleshooting → Build Fails

**Issue: API not working**
- Check [API Documentation](./API.md) → Error Handling
- Verify environment variables
- Check CORS settings

**Issue: Component not rendering**
- Review [Component Guide](./COMPONENTS.md) → Component Best Practices
- Check browser console for errors
- Verify prop types

**Issue: Database query fails**
- Check [API Documentation](./API.md) → Supabase Database Tables
- Verify RLS policies in Supabase dashboard
- Check user authentication status

---

## 📚 External Resources

### Official Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Learning Resources
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)
- [TypeScript for React Developers](https://www.typescriptlang.org/docs/handbook/react.html)
- [Supabase Tutorial](https://supabase.com/docs/guides/getting-started)

---

## 🤝 Contributing to Documentation

Documentation improvements are always welcome!

**To contribute:**
1. Fork the repository
2. Create a branch: `git checkout -b docs/improve-api-docs`
3. Make your changes
4. Ensure markdown is properly formatted
5. Submit a pull request

**Guidelines:**
- Keep explanations clear and concise
- Include practical examples
- Update the changelog
- Test code examples before committing
- Check for broken links

---

## 📝 Documentation Checklist

When adding a new feature:

- [ ] Update relevant documentation file
- [ ] Add code examples
- [ ] Update API docs if new endpoints added
- [ ] Update component guide if new components added
- [ ] Add entry to CHANGELOG.md
- [ ] Update main README if it's a major feature
- [ ] Check for broken links
- [ ] Review for clarity and completeness

---

## 📧 Support

If you can't find what you're looking for:

- Check the [main README](../README.md)
- Search existing [GitHub Issues](https://github.com/your-repo/issues)
- Ask in [GitHub Discussions](https://github.com/your-repo/discussions)
- Contact the maintainers

---

## 📅 Last Updated

This documentation was last updated on October 27, 2025.

---

**Happy coding! 🚀**
