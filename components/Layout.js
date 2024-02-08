import Header from "./Header";
import NavigationCard from "./NavigationCard";
import SpotifyStats from "./SpotifyStats";

export default function Layout({children, hideContent}) {
    return (
      <div>
        <Header hide={hideContent}/>
        <div className="flex mt-4 max-w-6xl mx-auto gap-6">
          {!hideContent && (
            <div className="w-1/4">
              <NavigationCard />
            </div>
          )}
          <div className={hideContent ? "w-full" : "w-5/12 mx-auto"}>
            {children}
          </div>
          {!hideContent && (
            <SpotifyStats />
          )}
        </div>
      </div>
    );
}