/**
 * Conit Recruitment - Stable Navigation System
 * This script enables partial page loading for a smoother navigation experience
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create page loader element
    const pageLoader = document.createElement('div');
    pageLoader.className = 'page-loader';
    document.body.prepend(pageLoader);

    // Add page-content class to main content sections
    const mainContent = document.querySelector('main') || 
                        document.querySelector('.page-banner')?.parentElement || 
                        document.querySelector('section:not(header):not(footer)');
    
    if (mainContent) {
        mainContent.classList.add('page-content');
    }

    // Intercept all internal navigation links
    const navLinks = document.querySelectorAll('a[href$=".html"]');
    
    navLinks.forEach(link => {
        // Only handle internal links
        if (link.hostname === window.location.hostname) {
            link.addEventListener('click', function(e) {
                const target = this.getAttribute('href');
                
                // Skip if ctrl/cmd key is pressed (open in new tab)
                if (e.ctrlKey || e.metaKey) return;
                
                e.preventDefault();
                navigateToPage(target);
            });
        }
    });
    
    // Function to navigate to a page without full reload
    function navigateToPage(url) {
        // Show loader
        pageLoader.classList.add('active');
        
        // Add loading state to content
        if (mainContent) {
            mainContent.classList.add('loading');
        }
        
        // Update active state in navigation
        updateActiveNavLink(url);
        
        // Fetch the new page content
        fetch(url)
            .then(response => response.text())
            .then(html => {
                // Parse the HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Extract the main content
                const newContent = doc.querySelector('main') || 
                                   doc.querySelector('.page-banner')?.parentElement || 
                                   doc.querySelector('section:not(header):not(footer)');
                
                if (newContent && mainContent) {
                    // Replace the content
                    mainContent.innerHTML = newContent.innerHTML;
                    
                    // Update page title
                    document.title = doc.title;
                    
                    // Update URL without reloading
                    window.history.pushState({path: url}, '', url);
                    
                    // Initialize any scripts that were in the new content
                    executeScripts(mainContent);
                    
                    // Initialize AOS if it exists
                    if (window.AOS) {
                        window.AOS.refresh();
                    }
                } else {
                    // If we couldn't find content sections, fallback to regular navigation
                    window.location.href = url;
                }
            })
            .catch(err => {
                console.error('Navigation failed:', err);
                window.location.href = url; // Fallback to normal navigation
            })
            .finally(() => {
                // Hide loader
                pageLoader.classList.remove('active');
                
                // Remove loading state from content
                if (mainContent) {
                    mainContent.classList.remove('loading');
                }
                
                // Scroll to top
                window.scrollTo(0, 0);
            });
    }
    
    // Update the active state in navigation
    function updateActiveNavLink(url) {
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === url) {
                link.classList.add('active');
            }
        });
    }
    
    // Execute scripts in the new content
    function executeScripts(element) {
        const scripts = element.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            
            // Copy attributes
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            
            // Copy inline script content
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            
            // Replace old script with new one
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }
    
    // Handle browser back/forward buttons
    window.onpopstate = function(event) {
        if (event.state && event.state.path) {
            navigateToPage(event.state.path);
        }
    };
}); 























