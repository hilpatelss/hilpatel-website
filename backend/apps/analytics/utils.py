"""
Analytics Utility Functions

Provides client parsing and data sanitization routines for:
- User-Agent inspection (Device, Browser family, OS family).
- External referrer classification (Search, Social, Campaign, Referral, Direct).
- URL and query string sanitization (preventing sensitive credential logging).
- Safe client IP resolution across standard reverse proxies (Cloudflare, Render, Nginx).
"""
import re
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse


SENSITIVE_PARAM_NAMES = {
    'token', 'key', 'auth', 'pass', 'password', 'secret', 'session',
    'access_token', 'id_token', 'refresh_token', 'api_key', 'apikey'
}

SEARCH_ENGINES = [
    'google', 'bing', 'duckduckgo', 'yahoo', 'baidu', 'yandex', 'ecosia', 'ask'
]

SOCIAL_NETWORKS = [
    'linkedin', 'github', 'twitter', 't.co', 'x.com', 'facebook', 'instagram',
    'reddit', 'youtube', 'threads', 'tiktok', 'discord'
]


def sanitize_url(raw_url: str, max_length: int = 500) -> str:
    """
    Strips sensitive authentication / credential parameters from URLs.
    """
    if not raw_url or not isinstance(raw_url, str):
        return ''
    try:
        parsed = urlparse(raw_url.strip()[:1000])
        if not parsed.netloc and not parsed.path:
            return raw_url.strip()[:max_length]
        
        if parsed.query:
            qs = parse_qs(parsed.query, keep_blank_values=True)
            cleaned_qs = {k: v for k, v in qs.items() if k.lower() not in SENSITIVE_PARAM_NAMES}
            new_query = urlencode(cleaned_qs, doseq=True)
            cleaned_url = urlunparse((
                parsed.scheme,
                parsed.netloc,
                parsed.path,
                parsed.params,
                new_query,
                ''
            ))
            return cleaned_url[:max_length]
        return raw_url.strip()[:max_length]
    except Exception:
        return raw_url.strip()[:max_length]


def sanitize_path(raw_path: str, max_length: int = 255) -> str:
    """
    Sanitizes an internal SPA route or path.
    """
    if not raw_path or not isinstance(raw_path, str):
        return '/'
    path = raw_path.strip()
    if not path.startswith('/'):
        path = '/' + path
    return path[:max_length]


def classify_referrer(raw_referrer: str, current_host: str = '') -> tuple[str, str]:
    """
    Classifies a raw referrer URL into (referrer_source, clean_referrer_url).
    Source options: 'direct', 'search', 'social', 'campaign', 'referral'.
    """
    if not raw_referrer or not isinstance(raw_referrer, str):
        return 'direct', ''
    
    clean_ref = sanitize_url(raw_referrer)
    try:
        parsed = urlparse(clean_ref)
        hostname = (parsed.hostname or '').lower()
        if not hostname:
            return 'direct', clean_ref
        
        # Check if internal navigation
        if current_host and (hostname == current_host.lower() or hostname.endswith('.' + current_host.lower())):
            return 'direct', clean_ref
        if 'hilpatel.site' in hostname or 'localhost' in hostname:
            return 'direct', clean_ref

        # Check search engines
        if any(engine in hostname for engine in SEARCH_ENGINES):
            return 'search', clean_ref

        # Check social networks
        if any(soc in hostname for soc in SOCIAL_NETWORKS):
            return 'social', clean_ref

        return 'referral', clean_ref
    except Exception:
        return 'referral', clean_ref[:500]


def parse_user_agent(user_agent: str) -> dict:
    """
    Extracts device category, browser family, and OS family from User-Agent string.
    """
    ua = (user_agent or '').lower()
    
    # 1. Device category
    device = 'desktop'
    if any(k in ua for k in ['ipad', 'tablet', 'playbook', 'silk', 'kindle']):
        device = 'tablet'
    elif any(k in ua for k in ['mobile', 'iphone', 'ipod', 'android', 'blackberry', 'phone', 'opera mini']):
        device = 'mobile'

    # 2. Operating System
    os_name = 'unknown'
    if 'macintosh' in ua or 'mac os' in ua:
        os_name = 'macOS'
    elif 'iphone' in ua or 'ipad' in ua or 'ipod' in ua:
        os_name = 'iOS'
    elif 'windows' in ua:
        os_name = 'Windows'
    elif 'android' in ua:
        os_name = 'Android'
    elif 'linux' in ua:
        os_name = 'Linux'
    elif 'cros' in ua:
        os_name = 'Chrome OS'

    # 3. Browser Family
    browser = 'unknown'
    if 'edg/' in ua or 'edge/' in ua:
        browser = 'Edge'
    elif 'opr/' in ua or 'opera' in ua:
        browser = 'Opera'
    elif 'chrome/' in ua or 'crios/' in ua:
        browser = 'Chrome'
    elif 'safari/' in ua and 'version/' in ua:
        browser = 'Safari'
    elif 'firefox/' in ua or 'fxios/' in ua:
        browser = 'Firefox'
    elif 'samsungbrowser' in ua:
        browser = 'Samsung Internet'

    return {
        'device_category': device,
        'os_category': os_name,
        'browser_category': browser,
    }


def get_client_ip(request) -> str:
    """
    Safely extracts client IP address handling reverse proxies and CDN headers.
    """
    # Cloudflare header takes highest precedence
    cf_ip = request.META.get('HTTP_CF_CONNECTING_IP')
    if cf_ip:
        return cf_ip.strip()

    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
        if ip:
            return ip
            
    return request.META.get('REMOTE_ADDR') or ''

